import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import newLoader from "./loader.module.css";

const GlobalLoading = () => {
  const isFetching = useIsFetching();

  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isFetching) {
      timer = setTimeout(() => setShow(true), 100);
    } else {
      clearTimeout(timer);
      setShow(false);
    }
    return () => clearTimeout(timer);
  }, [isFetching]);

  if (!show) return null;

  return (
    <div className="fixed overflow-hidden inset-0 bg-white z-100 flex items-center justify-center z-[100]">
      <div className="text-center">
        <h1 className="text-2xl mb-5">جاري التحميل</h1>
        <div className={`${newLoader.loader}`}></div>
      </div>
    </div>
  );
};

export default GlobalLoading;
