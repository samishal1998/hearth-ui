import type {
  HearthDataTableElement,
  HearthDropdownMenuElement,
  HearthToasterElement,
  HearthCommandPaletteElement,
  HearthLogViewerElement,
  HearthStatusPageElement,
  HearthResourceDetailElement,
} from "../src/elements";
export function mountDashboardElements(container: HTMLElement) {
  container.innerHTML = `<hearth-card title="Overlay and notification contracts"><div style="height:70px;overflow:hidden"><hearth-popover id="floating" label="Edit popover" title="Popover controls"><hearth-input label="Popover field"></hearth-input></hearth-popover><hearth-tooltip text="Contextual help across shadow roots" delay="20"><hearth-button>Custom tooltip trigger</hearth-button></hearth-tooltip></div><hearth-dropdown-menu id="command-menu" label="Record actions"></hearth-dropdown-menu><output id="menu-result"></output><hearth-button id="show-sheet">Open sheet</hearth-button><hearth-button id="show-toast">Show timed toast</hearth-button><hearth-button id="show-commands">Open command palette</hearth-button><hearth-sheet id="sheet" title="Record details"><hearth-input label="Sheet field"></hearth-input></hearth-sheet><hearth-command-palette id="commands"></hearth-command-palette><output id="command-result"></output><hearth-toaster id="notifications"></hearth-toaster></hearth-card>
  <hearth-data-table id="records" label="Records" selectable page-size="2"><span slot="cell:alpha:status">Custom cell content</span></hearth-data-table><output id="table-selection"></output>
  <hearth-card title="Files and native dates"><form id="files-form"><fieldset id="file-fields"><hearth-file-upload id="upload" label="Configuration files" name="config" accept=".json" multiple required max-size="1024" max-files="2"></hearth-file-upload><hearth-segmented-control id="display-mode" label="Display mode" name="view" value="grid"></hearth-segmented-control><hearth-input label="Schedule date" name="date" type="date"></hearth-input><hearth-input label="Schedule time" name="time" type="time"></hearth-input><hearth-input label="Local timestamp" name="timestamp" type="datetime-local"></hearth-input><hearth-button type="submit">Submit files</hearth-button><hearth-button type="reset">Reset files</hearth-button></fieldset></form><hearth-button id="disable-files">Toggle file fieldset</hearth-button><output id="files-result">Not submitted</output></hearth-card>
  <hearth-code-block id="code" title="Example command" line-numbers></hearth-code-block><hearth-copy-field label="Endpoint to copy" value="https://example.com"></hearth-copy-field><hearth-copy-field label="Secret example" value="not-a-real-secret" secret></hearth-copy-field>
  <hearth-log-viewer id="logs" label="Fixture logs" max-lines="20"></hearth-log-viewer><hearth-button id="append-log">Append fixture log</hearth-button><hearth-sparkline id="trend" label="Flat trend"></hearth-sparkline><hearth-resource-detail id="resource" title="Resource recipe"><p slot="overview">Forwarded overview slot.</p><p slot="logs">Forwarded logs slot.</p></hearth-resource-detail><hearth-provider-setup id="provider-recipe"></hearth-provider-setup><output id="provider-result"></output>`;
  const menu = container.querySelector("#command-menu") as InstanceType<
    typeof HearthDropdownMenuElement
  >;
  menu.items = [
    { id: "disabled", label: "Unavailable action", disabled: true },
    { id: "edit", label: "Edit record" },
    {
      id: "delete",
      label: "Delete record",
      danger: true,
      separatorBefore: true,
    },
  ];
  menu.addEventListener(
    "select",
    (e) =>
      (container.querySelector("#menu-result")!.textContent = (
        e as CustomEvent<[string]>
      ).detail[0]),
  );
  const sheet = container.querySelector("#sheet")!;
  container
    .querySelector("#show-sheet")!
    .addEventListener("click", () => Object.assign(sheet, { open: true }));
  sheet.addEventListener("close", () => Object.assign(sheet, { open: false }));
  const toaster = container.querySelector("#notifications") as InstanceType<
    typeof HearthToasterElement
  >;
  toaster.items = [];
  container
    .querySelector("#show-toast")!
    .addEventListener(
      "click",
      () =>
        (toaster.items = [
          {
            id: "test",
            title: "Timed notice",
            description: "Hover or focus to pause.",
            duration: 500,
          },
        ]),
    );
  toaster.addEventListener("dismiss", () => (toaster.items = []));
  const commands = container.querySelector("#commands") as InstanceType<
    typeof HearthCommandPaletteElement
  >;
  commands.items = [
    { id: "apps", label: "Open applications", group: "Navigate" },
    { id: "settings", label: "Open settings", group: "Navigate" },
    { id: "blocked", label: "Disabled command", disabled: true },
  ];
  container
    .querySelector("#show-commands")!
    .addEventListener("click", () => (commands.open = true));
  commands.addEventListener(
    "update:open",
    (e) => (commands.open = (e as CustomEvent<[boolean]>).detail[0]),
  );
  commands.addEventListener(
    "select",
    (e) =>
      (container.querySelector("#command-result")!.textContent = (
        e as CustomEvent<[string]>
      ).detail[0]),
  );
  const table = container.querySelector("#records") as InstanceType<
    typeof HearthDataTableElement
  >;
  table.rows = [
    { id: "alpha", name: "Alpha", port: 20, status: "Ready" },
    { id: "beta", name: "Beta", port: 2, status: "Ready" },
    { id: "gamma", name: "Gamma", port: 8, status: "Unknown" },
  ];
  table.columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "port", label: "Port", sortable: true },
    { key: "status", label: "Status" },
  ];
  table.addEventListener(
    "selection-change",
    (e) =>
      (container.querySelector("#table-selection")!.textContent =
        JSON.stringify((e as CustomEvent<[string[]]>).detail[0])),
  );
  Object.assign(container.querySelector("#display-mode")!, {
    options: [
      { value: "grid", label: "Grid view" },
      { value: "list", label: "List view" },
    ],
  });
  container.querySelector("#files-form")!.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    container.querySelector("#files-result")!.textContent = JSON.stringify({
      files: data
        .getAll("config")
        .map((value) => (value instanceof File ? value.name : value)),
      view: data.get("view"),
      date: data.get("date"),
      time: data.get("time"),
      timestamp: data.get("timestamp"),
    });
  });
  container.querySelector("#disable-files")!.addEventListener("click", () => {
    const fieldset = container.querySelector(
      "#file-fields",
    ) as HTMLFieldSetElement;
    fieldset.disabled = !fieldset.disabled;
  });
  Object.assign(container.querySelector("#code")!, {
    code: 'echo "<script>escaped</script>"\nsecond line',
    language: "sh",
  });
  const logs = container.querySelector("#logs") as InstanceType<
    typeof HearthLogViewerElement
  >;
  logs.entries = Array.from({ length: 40 }, (_, i) => ({
    id: String(i),
    level: i % 4 === 0 ? "error" : "info",
    message: `Entry ${i}`,
  }));
  container
    .querySelector("#append-log")!
    .addEventListener(
      "click",
      () =>
        (logs.entries = [
          ...(logs.entries || []),
          { id: "new", level: "info", message: "New tail entry" },
        ]),
    );
  Object.assign(container.querySelector("#trend")!, { values: [5, 5, 5] });
  const resource = container.querySelector("#resource") as InstanceType<
    typeof HearthResourceDetailElement
  >;
  resource.tabs = [
    { value: "overview", label: "Resource overview" },
    { value: "logs", label: "Resource logs" },
  ];
  container
    .querySelector("#provider-recipe")!
    .addEventListener(
      "test",
      (e) =>
        (container.querySelector("#provider-result")!.textContent =
          JSON.stringify(
            (e as CustomEvent<[{ name: string; endpoint: string }]>).detail[0],
          )),
    );
}
