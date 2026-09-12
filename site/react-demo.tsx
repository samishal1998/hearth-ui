import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { registerElements } from "@hearth/elements";
import "../dist/themes.css";
import "./fixtures.css";
registerElements();

// Framework-local JSX declarations stay out of the library's global types.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "hearth-theme": React.HTMLAttributes<HTMLElement> & {
        theme?: string;
        mode?: string;
      };
      "hearth-auth-page": React.HTMLAttributes<HTMLElement> & {
        brand?: string;
        description?: string;
        ref?: React.Ref<HTMLElement>;
      };
      "hearth-button": React.HTMLAttributes<HTMLElement> & {
        variant?: string;
        href?: string;
      };
      "hearth-input": React.HTMLAttributes<HTMLElement> & {
        label: string;
        name?: string;
        ref?: React.Ref<HTMLElement>;
      };
      "hearth-multi-select": React.HTMLAttributes<HTMLElement> & {
        label: string;
        modelValue: string[];
        options: { value: string; label: string }[];
        ref?: React.Ref<HTMLElement>;
      };
    }
  }
}
function Example() {
  const auth = useRef<HTMLElement>(null);
  const input = useRef<HTMLElement>(null);
  const multi = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<string[]>(["docker"]);
  const [user, setUser] = useState("");
  const [value, setValue] = useState("");
  const [theme, setTheme] = useState("sunset");
  useEffect(() => {
    const el = auth.current;
    if (!el) return;
    const onSubmit = (event: Event) => {
      const [data] = (
        event as CustomEvent<[{ username: string; password: string }]>
      ).detail;
      setUser(data.username);
    };
    el.addEventListener("submit", onSubmit);
    return () => el.removeEventListener("submit", onSubmit);
  }, []);
  useEffect(() => {
    const el = multi.current;
    if (!el) return;
    const change = (event: Event) =>
      setSelected((event as CustomEvent<[string[]]>).detail[0]);
    el.addEventListener("change", change);
    return () => el.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    const change = (event: Event) =>
      setValue((event as CustomEvent<[string]>).detail[0]);
    el.addEventListener("change", change);
    return () => el.removeEventListener("change", change);
  }, []);
  return (
    <hearth-theme theme={theme} mode="dark">
      <div className="react-toolbar">
        <hearth-button href="./#guide">Back to guide</hearth-button>
        <hearth-button
          onClick={() => setTheme((t) => (t === "sunset" ? "ocean" : "sunset"))}
        >
          Toggle React theme
        </hearth-button>
        <span>React host + bundled Vue web components</span>
      </div>
      <div className="fixture-content">
        <hearth-input ref={input} label="React-controlled event example" />
        <output aria-live="polite" id="react-value">
          {value}
        </output>
        <div className="fixture-spacer" />
        <hearth-multi-select
          ref={multi}
          label="React providers"
          modelValue={selected}
          options={[
            { value: "docker", label: "Docker" },
            { value: "traefik", label: "Traefik" },
          ]}
        />
        <output aria-live="polite" id="react-selections">
          {selected.join(", ")}
        </output>
        {user && (
          <p role="status" id="react-result">
            React received the sign-in event for {user}. No request was sent.
          </p>
        )}
      </div>
      <hearth-auth-page
        ref={auth}
        brand="homestead"
        description="This auth page is a web component in a React 19 application."
      />
    </hearth-theme>
  );
}
createRoot(document.getElementById("react-root")!).render(<Example />);
