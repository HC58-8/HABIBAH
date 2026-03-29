import React from "react";

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-8 relative">
      <div className="flex justify-between h-full">
        <div className="border-t-8 border-b-8 border-r-8 border-[var(--primary-color)] w-1/3 h-10 flex items-center justify-center rounded-r-full"></div>
        <div className="w-1/3 h-10 flex flex-col items-center justify-center text-center px-2">
          <h1 className="text-4xl font-bold text-[var(--primary-color)]">{title}</h1>
        </div>
        <div className="border-t-8 border-l-8 border-b-8 border-[var(--primary-color)] w-1/3 h-10 flex items-center justify-center rounded-l-full"></div>
      </div>
      <p className="text-center text-gray-600 mt-4">{subtitle}</p>
    </div>
  );
};

export default PageHeader;