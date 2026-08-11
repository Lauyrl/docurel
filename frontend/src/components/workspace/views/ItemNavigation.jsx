import "./css/ItemNavigation.css";
import { useExplorer } from "../../../context/ExplorerContext";

function ItemNavigation({ currentPageIdx }) {
  const {itemNavigationStackBackward, itemNavigationStackForward, navigateItems} = useExplorer();
  const canGoBackward = (
    (currentPageIdx === 0 && itemNavigationStackBackward.length > 1) || 
    ((currentPageIdx === 1 || currentPageIdx == 3) && itemNavigationStackBackward.length > 0)
  );

  const canGoForward = itemNavigationStackForward.length > 0;

  return (
    <>
      <button className="nav-button" style={{ opacity: canGoBackward ? 1.0 : 0.2 }} onClick={canGoBackward ? () => { navigateItems(true) } : undefined }>
        {"<"}
      </button>
      <button className="nav-button" style={{ opacity: canGoForward ? 1.0 : 0.2 }} onClick={canGoForward ? () => { navigateItems(false) } : undefined }>
        {">"}
      </button>
    </>
  )
}

export default ItemNavigation;
