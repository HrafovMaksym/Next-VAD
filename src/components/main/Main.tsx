import React from "react";

import Chat from "../chat/Chat";

const Main = () => {
  return (
    <div className="flex justify-center items-center flex-col gap-5 w-full h-[85vh] px-10 bg-[#f9f9f9]">
      <Chat />
    </div>
  );
};

export default Main;
