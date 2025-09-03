import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, onToggle }) => {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-primary h-12 flex items-center z-10">
        {isOpen ? (
          <XMarkIcon
            className="w-6 h-6 text-white cursor-pointer ml-4"
            onClick={onToggle}
          />
        ) : (
          <Bars3Icon
            className="w-6 h-6 text-white cursor-pointer ml-4"
            onClick={onToggle}
          />
        )}
        <h3 className="text-white text-lg font-semibold ml-4">
          ERISA Eligibility
        </h3>
      </div>

      <aside
        className={`fixed top-12 left-0 h-[calc(100vh-3rem)] bg-white shadow-md
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-16"}`}
      >
        <nav className="flex flex-col px-4 py-6 space-y-4">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2"
          >
            <span>📄</span>
            <span
              className={`${!isOpen ? "hidden" : "block"} whitespace-nowrap`}
            >
              Run Evaluation
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2"
          >
            <span>📊</span>
            <span
              className={`${!isOpen ? "hidden" : "block"} whitespace-nowrap`}
            >
              Evaluation Dashboard
            </span>
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
