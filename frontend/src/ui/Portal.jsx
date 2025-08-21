import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

function Portal({ children, container = null, className = "" }) {
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    let node = container;
    let created = false;

    if (!node) {
      node = document.getElementById("portal-root");
      if (!node) {
        node = document.createElement("div");
        node.id = "portal-root";
        node.className = "portal-container";
        node.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
      `;
        document.body.appendChild(node);
        created = true;
      }
    }

    setMountNode(node);

    return () => {
      if (
        created &&
        node.parentNode === document.body &&
        !node.hasChildNodes()
      ) {
        document.body.removeChild(node);
      }
    };
  }, [container]);

  if (!mountNode) return null;

  // Add className to portal content if provided
  const portalContent = className ? (
    <div className={className}>{children}</div>
  ) : (
    children
  );

  return createPortal(portalContent, mountNode);
}

Portal.propTypes = {
  children: PropTypes.node.isRequired,
  container: PropTypes.instanceOf(Element),
  className: PropTypes.string,
};

export default Portal;
