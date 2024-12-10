import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";
import ReactDOM from "react-dom/client";
import { FaBook, FaPlus } from "react-icons/fa";
import { MdEventNote } from "react-icons/md";
import Actions from "./pages/actions";
import Elements from "./pages/elements";
import { motion } from "framer-motion";
import Wordlists from "./pages/wordlists";
import ErrorBoundary from "./components/error_boundary";
import Base from "./components/base";

type Route = {
  display_name: string;
  elem: ReactNode;
  icon: ReactNode;
};

type Router = {
  default_route: number;
  routes: Route[];
};

const router: Router = {
  default_route: 0,
  routes: [
    {
      display_name: "Actions",
      elem: <Actions />,
      icon: <MdEventNote className="mr-2" />,
    },
    {
      display_name: "Wordlists",
      elem: <Wordlists />,
      icon: <FaBook className="mr-2" />,
    },

    {
      display_name: "Elements",
      elem: <Elements />,
      icon: <FaPlus className="mr-2" />,
    },
  ],
};

function Menu({
  active_tab,
  set_active_tab,
}: {
  active_tab: number;
  set_active_tab: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className="flex gap-4 bg-pink-200 p-4 overflow-x-scroll custom-scrollbar">
      {router.routes.map((r, i) => (
        <button
          onClick={() => set_active_tab(i)}
          className={`flex items-center ${
            i === active_tab ? "text-pink-800" : "text-pink-600"
          } hover:text-pink-800 transition-colors`}
        >
          {r.icon}
          {r.display_name}
        </button>
      ))}
    </div>
  );
}

function HomePage() {
  const [active_tab, set_active_tab] = useState(router.default_route);

  return (
    <Base>
      <Menu active_tab={active_tab} set_active_tab={set_active_tab} />
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <h2 className="text-2xl font-bold text-pink-800 mb-4">
            {router.routes[active_tab].display_name}
          </h2>
          {router.routes[active_tab].elem}
        </motion.div>
      </div>
    </Base>
  );
}

ReactDOM.createRoot(document.body).render(
  <ErrorBoundary>
    <React.StrictMode>
      <HomePage />
    </React.StrictMode>
  </ErrorBoundary>,
);
