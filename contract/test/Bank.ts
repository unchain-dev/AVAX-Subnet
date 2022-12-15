import { ethers } from "hardhat";
import { BigNumber, Overrides } from "ethers";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Bank", function () {
  async function getLastBlockTimeStamp() {
    const blockNumberBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumberBefore);
    return BigNumber.from(blockBefore.timestamp);
  }

  async function deployContract() {
    const accounts = await ethers.getSigners();

    const Bank = await ethers.getContractFactory("Bank");
    const bank = await Bank.deploy({
      value: 10000,
    } as Overrides);

    return {
      deployAccount: accounts[0],
      userAccounts: accounts.slice(1, accounts.length),
      bank,
    };
  }

  describe("issueBill", function () {
    it("Correct bill issued.", async function () {
      const { bank, userAccounts } = await loadFixture(deployContract);

      const issuer = userAccounts[0];
      const recipient = userAccounts[1];
      const price = 100;

      await bank.connect(issuer).issueBill(price, recipient.address);
      const newId = 0;

      const bill = await bank.allBills(newId);
      const activeStatus = 0;

      expect(bill.id).to.equal(newId);
      expect(bill.price).to.equal(price);
      expect(bill.timestamp).to.equal(await getLastBlockTimeStamp());
      expect(bill.issuer).to.equal(issuer.address);
      expect(bill.recipient).to.equal(recipient.address);
      expect(bill.status).to.equal(activeStatus);
    });
  });

  describe("cashBill", function () {
    it("Token is transferred correctly.", async function () {
      const { bank, userAccounts } = await loadFixture(deployContract);

      const issuer = userAccounts[0];
      const recipient = userAccounts[1];
      const price = 100;

      await bank.connect(issuer).issueBill(price, recipient.address);
      const newId = 0;

      await expect(
        bank.connect(recipient).cashBill(newId)
      ).to.changeEtherBalances([bank, recipient], [-price, price]);
    });

    it("Revert if call twice.", async function () {
      const { bank, userAccounts } = await loadFixture(deployContract);

      const issuer = userAccounts[0];
      const recipient = userAccounts[1];
      const price = 100;

      await bank.connect(issuer).issueBill(price, recipient.address);
      const newId = 0;

      await bank.connect(recipient).cashBill(newId);
      await expect(bank.connect(recipient).cashBill(newId)).to.be.reverted;
    });

    it("Revert if different user call.", async function () {
      const { bank, userAccounts } = await loadFixture(deployContract);

      const issuer = userAccounts[0];
      const recipient = userAccounts[1];
      const price = 100;

      await bank.connect(issuer).issueBill(price, recipient.address);
      const newId = 0;

      await expect(bank.connect(issuer).cashBill(newId)).to.be.reverted;
    });
  });

  // describe("repay", function () {
  //   it("Bills is properly repaid", async function () {
  //     const { bank, userAccounts } = await loadFixture(deployContract);

  //     const oneWeekInSecond = 60 * 60 * 24 * 7;

  //     const borrower = userAccounts[0];
  //     const lender = userAccounts[1];
  //     const price = 100;
  //     const expirationDate = BigNumber.from(Date.now())
  //       .div(1000) // in second
  //       .add(oneWeekInSecond); // one week later

  //     await bank.connect(borrower).request(price, expirationDate);

  //     await bank.connect(lender).lend(0, { value: price } as Overrides);

  //     await expect(
  //       bank.connect(borrower).repay(0, { value: price } as Overrides)
  //     ).to.changeEtherBalances([borrower, lender], [-price, price]);

  //     const bill = await bank.getBill(0);

  //     expect(bill.status).to.equal(2);
  //   });
  // });

  // describe("claim", function () {
  //   it("Bills is properly claimed", async function () {
  //     const { bank, userAccounts } = await loadFixture(deployContract);

  //     const oneWeekInSecond = 60 * 60 * 24 * 7;

  //     const borrower = userAccounts[0];
  //     const lender = userAccounts[1];
  //     const price = 100;
  //     const expirationDate = BigNumber.from(Date.now())
  //       .div(1000) // in second
  //       .add(oneWeekInSecond); // one week later

  //     await bank.connect(borrower).request(price, expirationDate);

  //     const bill = await bank.getBill(0);

  //     expect(bill.status).to.equal(2);
  //   });
  // });
});
