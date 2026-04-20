const { accountModel } = require("../models/account.model.js");
const { ledgerModel } = require("../models/ledger.model.js");
const { transactionModel } = require("../models/transaction.model.js");
const mongoose = require("mongoose");
const {
  sendTransactionEmail,
  sendTransactionFAILEmail,
} = require("../services/email.service.js");

/**
 * - Create a new transaction
 * - POST/api/transaction/
 * THE 10 STEP TRANSFER FLOW:
 * first auth middleware
 * 1. Validate request ( check if we got fromAcc,toAcc,amount,idempotencyKey or not AND check if fromAcc and toAcc are valid Accounts )
 * 2. Validate idempotencyKey
 * 3. Check Account Status
 * 4. Derive sender balance from ledger
 * ////start session////
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * ////end session////
 * 9. Commit MongoDB session
 * 10. Send email notification
 */
async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized user",
    });
  }

  /**
   * Step 1: Validate Request
   */
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "Missing required fields: fromAccount, toAccount, amount, idempotencyKey",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid From or To Account",
    });
  }

  /**
   * Step 2: Validate idempotencyKey
   */

  const TransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (TransactionAlreadyExists) {
    if (TransactionAlreadyExists.status == "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: TransactionAlreadyExists,
      });
    }
    if (TransactionAlreadyExists.status == "PENDING") {
      return res.status(200).json({
        message: "Transaction is being processed",
      });
    }
    if (TransactionAlreadyExists.status == "FAILED") {
      return res.status(400).json({
        message: "Transaction Failed previously, please try again",
      });
    }
    if (TransactionAlreadyExists.status == "REVERSED") {
      return res.status(400).json({
        message: "Transaction was reversed, please try again",
      });
    }
  }

  /**
   * Step 3: Check Account Status
   */

  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both From and To Accounts must be ACTIVE to process the transaction",
    });
  }

  /**
   * Step 4:  Derive sender balance from ledger
   */
  const balance = await fromUserAccount.GetBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Senders account balance is ${balance},Amount requested to send is ${amount}, NOT POSSIBLE!`,
    });
  }

  /**
   * Step 5 - 9 : Create Transaction(Pending) , ledger entries , update transaction status (Completed)
   */

  let transaction; //we are initialising it outside try cuz we will be displaying it outside try in last result also
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    //notice that here, it gives an array and thus we are using [0]
    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
          },
        ],
        { session: session },
      )
    )[0];
    //while using .create , session should be mentioned and data should be in an array when we are using session.
    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          transaction: transaction._id,
          type: "DEBIT",
          amount,
        },
      ],
      { session: session },
    );

    //this below await functions waits 100s before going further. this is done to simulate a case where the debit takes place but the credit is not done(process gets stuck in btw) , then if the user tries to do transaction again(with same IdempotencyKey), he will get notified that transaction failed and rolled back. therfore we used TRY-CATCH to handle that error.
    await (() => {
      return new Promise((resolve) => setTimeout(resolve, 100 * 1000));
    })();

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          transaction: transaction._id,
          type: "CREDIT",
          amount,
        },
      ],
      { session: session },
    );

    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(400).json({
      message: "Transaction failed, rolled back safely",
    });
  }
  /**
   * Step : 10 Send Transaction Email
   */

  await sendTransactionEmail(user.email, user.name, amount, toAccount);

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction,
  });
}

/**
 * -creates intial funds using system acc-transaction
 * -POST/api/transaction/system/deposit
 */
async function createInitialFund(req, res) {
  const { toAccount, idempotencyKey, amount } = req.body;

  //CHECK if all inputs are there or not
  if (!toAccount || !idempotencyKey || !amount) {
    return res.status(400).json({
      message: "Missing required fields: toAccount, idempotencyKey, amount",
    });
  }
  //check if toAccount is valid or not
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid ToAccount",
    });
  }

  //get fromuseraccount(system acc) and check if its exist or not
  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System Account for the user not found",
    });
  }

  //start transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  //notice that here, it gives an array and thus we are using [0]
  const transaction = (
    await transactionModel.create(
      [
        {
          fromAccount: fromUserAccount._id,
          toAccount,
          amount,
          idempotencyKey,
          status: "PENDING",
        },
      ],
      { session },
    )
  )[0];
  //while using session, data should be in array
  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        transaction: transaction._id,
        type: "DEBIT",
        amount,
      },
    ],
    { session: session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        transaction: transaction._id,
        type: "CREDIT",
        amount,
      },
    ],
    { session: session },
  );

  await transactionModel.findOneAndUpdate(
    { _id: transaction._id },
    { status: "COMPLETED" },
    { session },
  );

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial fund deposited successfully",
    transaction: transaction,
  });
}

module.exports = { createTransaction, createInitialFund };
