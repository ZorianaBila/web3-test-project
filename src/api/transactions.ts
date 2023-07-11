import axios from "axios";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

interface Transaction{
    sender: string;
    receiver: string | null;
    hash: string;
}
export const addNewTransaction = async (transaction: Transaction) =>{
    return await axios({
    method: "post",
    url: baseUrl + "transactions",
    data: {...transaction}
  });
};

