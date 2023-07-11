import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import Web3 from "web3";
import { addNewTransaction } from "../api/transactions";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  sendAmount: number;
  mode: string;
  recieverAdd: string;
  gasLimit: number;
  gasFee: string;
  getBabyDogeContractAddress: (web3: Web3) => any;
  account: string | null | undefined;
  library: any;
  valueload: () => void;
}
export default function ModalConfirm({
  sendAmount,
  recieverAdd,
  mode,
  gasFee,
  getBabyDogeContractAddress,
  account,
  onClose,
  isOpen,
  library,
  valueload,
  gasLimit,
}: ModalProps) {
  const sendBaby = async (web3: Web3) => {
    const ctx = getBabyDogeContractAddress(web3);
    const transaction = await ctx.methods
      .transfer(recieverAdd, Web3.utils.toWei(sendAmount.toString(), "gwei"))
      .send(
        {
          from: account,
          gasPrice: gasFee,
        },
        async (error: any) => {
          if (error) {
            console.error(error);
          }
        }
      );

    return transaction.transactionHash;
  };

  const sendBNB = async (web3: Web3) => {
    const txParams: any = {
      from: account,
      to: recieverAdd,
      value: Web3.utils.toWei(sendAmount.toString(), "ether"),
      gasPrice: gasFee,
    };
    const transaction = await web3.eth.sendTransaction(
      txParams,
      async (error: any) => {
        if (error) {
          console.error(error);
        }
      }
    );
    return transaction.transactionHash;
  };

  const sendAction = async () => {
    const web3 = new Web3(library.provider);
    const transactionHash =
      mode === "BNB" ? await sendBNB(web3) : await sendBaby(web3);
    try {
      const transactionDetails = await web3.eth.getTransaction(transactionHash);
      console.log("Transaction Details:", transactionDetails);

      const transactions = await addNewTransaction({
        sender: transactionDetails.from,
        receiver: transactionDetails.to,
        hash: transactionDetails.hash,
      });
      console.log("Transactions:", transactions.data);
    } catch (error) {
      console.error("Error retrieving transaction details:", error);
    }
    onClose();
    valueload();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Are you Sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div>
            Are you sure {sendAmount} {mode} to {recieverAdd}
            {"  "}
            user?
          </div>
          <div>Gas Limit: {gasLimit}</div>
          <div>Gas Price: {gasFee}</div>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost" onClick={sendAction}>
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
