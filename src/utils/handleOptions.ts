import toast from "react-hot-toast";
import handleErrorAlerts from "./showErrorMessages";

const handleOption = (addOptions: any, model: string, data: any) => {
  return addOptions
    .mutateAsync({
      model,
      ...data,
    })
    .then((res: any) => {
      if (res.status) {
        toast.success(`${data.name} created successfully`);
        return Promise.resolve();
      } else {
        handleErrorAlerts(res.error);
        return Promise.reject(res.error);
      }
    })
    .catch((err: any) => {
      handleErrorAlerts(err.response?.data?.error || "Unknown error");
      return Promise.reject(err);
    });
};

export default handleOption;
