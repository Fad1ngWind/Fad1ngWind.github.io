import { createRoot } from "react-dom/client";
import Footprint from "./Footprint";
import { readPlaces } from "./places.mjs";
import "../../../assets/css/readme-base.css";
import "../../../assets/landing/fonts/jetbrains-mono.css";
import "./footprint.css";

const container = document.querySelector<HTMLElement>("#footprint-app");
if (container) {
  const root = createRoot(container);
  readPlaces()
    .then((places) => root.render(<Footprint places={places} />))
    .catch(() => root.render(<>
      <p className="footprint-status" role="status">地点数据暂时无法读取，你仍可以浏览地图。</p>
      <Footprint places={[]} />
    </>));
}
