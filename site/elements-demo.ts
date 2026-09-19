import { registerElements } from "@hearth/elements";
import "../packages/elements/dist/themes.css";
import "./fixtures.css";
import type {
  HearthSelectElement,
  HearthTabsElement,
  HearthAppCardElement,
  HearthDialogElement,
  HearthThemeElement,
} from "../src/elements";
registerElements();
registerElements();
import { mountAdvancedExamples } from "./advanced-elements";
import {mountDashboardElements} from './dashboard-elements';
const advanced = document.createElement("section");
advanced.id = "advanced-examples";
advanced.className = "fixture-grid";
document.querySelector(".fixture-content")!.appendChild(advanced);
mountAdvancedExamples(advanced);
const dashboard=document.createElement('section');dashboard.id='dashboard-examples';dashboard.className='fixture-grid';document.querySelector('.fixture-content')!.appendChild(dashboard);mountDashboardElements(dashboard);
const select = document.querySelector("#category") as InstanceType<
  typeof HearthSelectElement
>;
select.options = [
  { value: "media", label: "Media" },
  { value: "development", label: "Development" },
];
const tabs = document.querySelector("#example-tabs") as InstanceType<
  typeof HearthTabsElement
>;
tabs.items = [
  { value: "overview", label: "Overview" },
  { value: "details", label: "Details" },
  { value: "disabled", label: "Unavailable", disabled: true },
];
const app = document.querySelector("#example-app") as InstanceType<
  typeof HearthAppCardElement
>;
app.addEventListener("favorite-change", (event) => {
  app.favorite = (event as CustomEvent<[boolean]>).detail[0];
});
const dialog = document.querySelector("#example-dialog") as InstanceType<
  typeof HearthDialogElement
>;
dialog.addEventListener("close", () => (dialog.open = false));
document
  .querySelector("#open-dialog")!
  .addEventListener("click", () => (dialog.open = true));
document
  .querySelector("#close-dialog")!
  .addEventListener("click", () => (dialog.open = false));
const island = document.querySelector("#island") as InstanceType<
  typeof HearthThemeElement
>;
document
  .querySelector("#ocean")!
  .addEventListener("click", () => (island.theme = "ocean"));
document
  .querySelector("#light")!
  .addEventListener("click", () => (island.mode = "light"));
document.querySelector("#disable-fields")!.addEventListener("click", () => {
  const fields = document.querySelector("#fields") as HTMLFieldSetElement;
  fields.disabled = !fields.disabled;
});
document.querySelector("#example-form")!.addEventListener("submit", (e) => {
  e.preventDefault();
  document.querySelector("#form-result")!.textContent = JSON.stringify(
    Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement)),
  );
});
