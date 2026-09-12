import type {
  HearthComboboxElement,
  HearthRadioGroupElement,
  HearthNavigationMenuElement,
  HearthAccordionElement,
  HearthTabsElement,
  HearthSidebarElement,
  HearthPaginationElement,
} from "../src/elements";

export function mountAdvancedExamples(container: HTMLElement) {
  container.innerHTML = `<hearth-card title="Expanded form controls" description="The 0.2 collection, using the compiled web components."><form id="advanced-form"><fieldset id="advanced-fields"><hearth-combobox id="providers" label="Choose providers" name="providers" multiple required value="docker"></hearth-combobox><hearth-combobox id="default-provider" label="Default provider" name="primary" value="docker" required></hearth-combobox><hearth-radio-group id="access" name="access" label="Dashboard access" value="private" required></hearth-radio-group><hearth-checkbox id="summaries" name="summaries" label="Email summaries" value="yes" indeterminate></hearth-checkbox><hearth-textarea id="notes" name="notes" label="Notes" value="Initial note"></hearth-textarea><hearth-range id="interval" name="interval" label="Refresh interval" value="5" min="1" max="60" unit=" min"></hearth-range><hearth-button-bar label="Advanced form actions"><hearth-button type="submit" variant="primary">Save advanced form</hearth-button><hearth-button type="reset">Reset advanced form</hearth-button></hearth-button-bar></fieldset></form><hearth-button id="disable-advanced">Toggle advanced fieldset</hearth-button><output id="advanced-result" aria-live="polite">Nothing submitted yet.</output></hearth-card>
  <hearth-card title="Navigation and feedback"><hearth-navigation-menu id="advanced-menu" label="Example navigation"></hearth-navigation-menu><hearth-separator></hearth-separator><hearth-tabs id="advanced-tabs" label="Manual vertical tabs" orientation="vertical" activation="manual" variant="underline"><p slot="general">General configuration panel.</p><p slot="appearance">Appearance configuration panel.</p></hearth-tabs><hearth-separator></hearth-separator><hearth-progress id="scan-progress" label="Scan progress" value="35"></hearth-progress><hearth-progress label="Pending scan" indeterminate></hearth-progress><hearth-separator></hearth-separator><hearth-pagination id="pagination" total="100" page-size="10"></hearth-pagination><output id="page-result">Page 1</output><hearth-accordion id="faq"></hearth-accordion><hearth-avatar name="Sami Mishal" src="/missing-avatar.png"></hearth-avatar><hearth-skeleton variant="circle" width="40px" label="Loading profile"></hearth-skeleton></hearth-card><hearth-sidebar id="standalone-sidebar" brand="hearth"></hearth-sidebar>`;
  const choices = [
    { value: "docker", label: "Docker", description: "Container provider" },
    { value: "traefik", label: "Traefik", description: "Proxy provider" },
    {
      value: "caddy",
      label: "Caddy",
      description: "Unavailable provider",
      disabled: true,
    },
    { value: "manual", label: "Manual" },
  ];
  const providers = container.querySelector("#providers") as InstanceType<
    typeof HearthComboboxElement
  >;
  providers.options = choices;
  const primary = container.querySelector("#default-provider") as InstanceType<
    typeof HearthComboboxElement
  >;
  primary.options = choices;
  const access = container.querySelector("#access") as InstanceType<
    typeof HearthRadioGroupElement
  >;
  access.options = [
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
    { value: "team", label: "Team", disabled: true },
  ];
  const menu = container.querySelector("#advanced-menu") as InstanceType<
    typeof HearthNavigationMenuElement
  >;
  menu.items = [
    { id: "home", label: "Home" },
    {
      id: "manage",
      label: "Manage",
      children: [
        {
          id: "locked",
          label: "Unavailable link",
          href: "#locked",
          disabled: true,
        },
        { id: "apps", label: "Apps" },
        { id: "providers", label: "Providers" },
      ],
    },
  ];
  menu.addEventListener(
    "navigate",
    (e) => (menu.active = (e as CustomEvent<[string]>).detail[0]),
  );
  const tabs = container.querySelector("#advanced-tabs") as InstanceType<
    typeof HearthTabsElement
  >;
  tabs.items = [
    { value: "general", label: "General" },
    { value: "appearance", label: "Appearance" },
  ];
  const faq = container.querySelector("#faq") as InstanceType<
    typeof HearthAccordionElement
  >;
  faq.items = [
    {
      id: "data",
      title: "Where is the data?",
      description: "Your application owns its data.",
    },
    {
      id: "theme",
      title: "Can I change the theme?",
      description: "Every Hearth token is configurable.",
    },
  ];
  const sidebar = container.querySelector(
    "#standalone-sidebar",
  ) as InstanceType<typeof HearthSidebarElement>;
  sidebar.items = [
    { id: "home", label: "Overview", icon: "home" },
    { id: "apps", label: "Applications", icon: "apps" },
  ];
  sidebar.addEventListener(
    "navigate",
    (e) => (sidebar.active = (e as CustomEvent<[string]>).detail[0]),
  );
  const pagination = container.querySelector("#pagination") as InstanceType<
    typeof HearthPaginationElement
  >;
  pagination.addEventListener(
    "change",
    (e) =>
      (container.querySelector("#page-result")!.textContent =
        `Page ${(e as CustomEvent<[number]>).detail[0]}`),
  );
  container.querySelector("#advanced-form")!.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    container.querySelector("#advanced-result")!.textContent = JSON.stringify({
      ...Object.fromEntries(data),
      providers: data.getAll("providers"),
    });
  });
  providers.addEventListener("change", () => {
    container.dataset.providerValues = JSON.stringify(
      new FormData(
        container.querySelector<HTMLFormElement>("#advanced-form")!,
      ).getAll("providers"),
    );
  });
  container
    .querySelector("#disable-advanced")!
    .addEventListener("click", () => {
      const fields = container.querySelector(
        "#advanced-fields",
      ) as HTMLFieldSetElement;
      fields.disabled = !fields.disabled;
    });
}
