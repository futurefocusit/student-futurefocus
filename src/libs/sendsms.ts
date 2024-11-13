import axios from "axios";
import { toast } from "react-toastify";
export interface smsInterface {

  key: string;
  message: string;
  recipients:[string]
}

export const sendMessage= async(data:smsInterface) =>{
  try {

    const response = await axios.post("https://itecsms.rw/api/sendsms", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = response.data;
    const status = responseData.status;

    if (status === 200) {
      const message = responseData.message;
      toast.success(message);

     
    } else {
      toast.error('failed to send sms')
    }
  } catch (error) {
    // @ts-expect-error error
    console.error("Error:", error.message);
      toast.error("internal server error");

  }
}

// Call the function to make the payment

