import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";
import { Button, Box, Text, Input, Switch } from "@chakra-ui/react";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { injected } from "../config/wallets";
import abi from "./abi.json";
import { AbiItem } from "web3-utils";
import ModalConfirm from "./ModalConfirm";

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function ConnectButton() {
  const { account, active, activate, library, deactivate, chainId } =
    useWeb3React();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [connected, setConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>("0");
  const [babyBalance, setBabyBalance] = useState<string>("0");
  const [mode, setMode] = useState<string>("BNB");
  const [recieverAdd, setRecieverAdd] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<number>(0);
  const [gasFee, setGasFee] = useState<string>("");
  const [gasLimit, setGasLimit] = useState<number>(0);
  const toast = useToast();

  const AccountInformation = [
    {
      name: "Account",
      value: `${account?.slice(0, 6)}...${account?.slice(
        account.length - 4,
        account.length
      )}`,
    },
    {
      name: "BabyDoge Balance",
      value: babyBalance,
    },
    {
      name: "BNB Balance",
      value: balance,
    },
  ];

  function handleConnectWallet() {
    connected ? deactivate() : activate(injected);
    setConnected(!connected);
  }

  function handleMode() {
    setMode(mode === "BNB" ? "BabyDoge" : "BNB");
  }

  function handleChangeAddress(event: any) {
    setRecieverAdd(event.target.value);
  }

  function handleChangeAmount(event: any) {
    setSendAmount(event.target.value);
  }

  async function handleOpenModal() {
    if (!recieverAdd) {
      return toast({
        description: "Please input Receiver Address",
        status: "error",
      });
    }
    if (!sendAmount || sendAmount === 0) {
      return toast({
        description: "Please input send amount",
        status: "error",
      });
    }

    const web3 = new Web3(library.provider);
    var block = await web3.eth.getBlock("latest");
    setGasLimit(block.gasLimit);
    const gasPrice = await web3.eth.getGasPrice();
    setGasFee(gasPrice);
    onOpen();
  }

  function fromWei(
    web3: { utils: { fromWei: (arg0: any) => any } },
    val: { toString: () => any }
  ) {
    if (val) {
      val = val.toString();
      return web3.utils.fromWei(val);
    } else {
      return "0";
    }
  }

  function toGWei(web3: any, val: string) {
    if (val) {
      return web3.utils.fromWei(val, "gwei");
    } else {
      return "0";
    }
  }

  const getBabyDogeContractAddress = useCallback(
    (web3: Web3) => {
      const babyContractAddress =
        chainId === 1
          ? process.env.REACT_APP_BABYDOGE_CONTRACT_ADDRESS
          : process.env.REACT_APP_TEST_BABYDOGE_CONTRACT_ADDRESS;
      const ctx = new web3.eth.Contract(abi as AbiItem[], babyContractAddress);
      return ctx;
    },
    [chainId]
  );

  const valueload = useCallback(async () => {
    const web3 = new Web3(library.provider);
    const ctx = getBabyDogeContractAddress(web3);
    if (account) {
      const value = await web3.eth.getBalance(account);
      setBalance(Number(fromWei(web3, value)).toFixed(5));
      try {
        const value1 = await ctx.methods.balanceOf(account).call();
        setBabyBalance(Number(toGWei(web3, value1)).toFixed(5));
      } catch (ex: any) {
        setBabyBalance(Number(0).toFixed(5));
      }
    }
  }, [account, library, getBabyDogeContractAddress]);

  useEffect(() => {
    active && valueload();
  }, [account, active, valueload]);

  return (
    <>
      <h1 className="title">Metamask login demo from Enva Division</h1>
      {account ? (
        <Box
          display="block"
          alignItems="center"
          background="white"
          borderRadius="xl"
          p="4"
          width="300px"
        >
          {AccountInformation.map((data, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb="2"
            >
              <Text color="#158DE8" fontWeight="medium">
                {data.name}
              </Text>
              <Text color="#6A6A6A" fontWeight="medium">
                {data.value}
              </Text>
            </Box>
          ))}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="2"
          >
            <Text color="#158DE8" fontWeight="medium">
              BNB / BabyDoge
            </Text>
            <Switch size="md" value={mode} onChange={handleMode} />
          </Box>
          <Box
            display="block"
            justifyContent="space-between"
            alignItems="center"
            mb="4"
          >
            <Text color="#158DE8" fontWeight="medium">
              Send {mode}:
            </Text>
            <Input
              bg="#EBEBEB"
              size="lg"
              value={recieverAdd}
              onChange={handleChangeAddress}
            />
          </Box>
          <Box display="flex" alignItems="center" mb="4">
            <Input
              bg="#EBEBEB"
              size="lg"
              value={sendAmount}
              onChange={handleChangeAmount}
            />
            <Button
              onClick={handleOpenModal}
              ml="2"
              bg="#158DE8"
              color="white"
              fontWeight="medium"
              borderRadius="xl"
              border="1px solid transparent"
              _hover={{
                borderColor: "blue.700",
                color: "gray.800",
              }}
              _active={{
                backgroundColor: "blue.800",
                borderColor: "blue.700",
              }}
            >
              Send
            </Button>
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Button
              onClick={handleConnectWallet}
              bg="#158DE8"
              color="white"
              fontWeight="medium"
              borderRadius="xl"
              border="1px solid transparent"
              width="300px"
              _hover={{
                borderColor: "blue.700",
                color: "gray.800",
              }}
              _active={{
                backgroundColor: "blue.800",
                borderColor: "blue.700",
              }}
            >
              Disconnect Wallet
            </Button>
          </Box>
          <ModalConfirm
            isOpen={isOpen}
            onClose={onClose}
            sendAmount={sendAmount}
            mode={mode}
            recieverAdd={recieverAdd}
            gasLimit={gasLimit}
            gasFee={gasFee}
            account={account}
            library={library}
            getBabyDogeContractAddress={getBabyDogeContractAddress}
            valueload={valueload}
          />
        </Box>
      ) : (
        <Box bg="white" p="4" borderRadius="xl">
          <Button
            onClick={handleConnectWallet}
            bg="#158DE8"
            color="white"
            fontWeight="medium"
            borderRadius="xl"
            border="1px solid transparent"
            width="300px"
            _hover={{
              borderColor: "blue.700",
              color: "gray.800",
            }}
            _active={{
              backgroundColor: "blue.800",
              borderColor: "blue.700",
            }}
          >
            Connect Wallet
          </Button>
        </Box>
      )}
    </>
  );
}
