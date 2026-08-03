// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { SelectMenu, type SelectMenuOption } from "./SelectMenu";

const options: readonly SelectMenuOption<string>[] = [
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
];

function SelectHarness() {
  const [value, setValue] = useState("alpha");
  return <SelectMenu label="Example" value={value} options={options} onChange={setValue} />;
}

afterEach(cleanup);

describe("SelectMenu", () => {
  it("renders an anchored listbox and commits a pointer selection", () => {
    render(<SelectHarness />);
    const trigger = screen.getByRole("combobox", { name: "Example" });

    fireEvent.click(trigger);
    const listbox = screen.getByRole("listbox", { name: "Example options" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(within(listbox).getByRole("option", { name: "Alpha" })).toHaveAttribute("aria-selected", "true");

    fireEvent.pointerDown(within(listbox).getByRole("option", { name: "Beta" }));
    fireEvent.click(within(listbox).getByRole("option", { name: "Beta" }));
    expect(trigger).toHaveTextContent("Beta");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("supports arrows, typeahead, and Escape without dismissing its parent", () => {
    render(<SelectHarness />);
    const trigger = screen.getByRole("combobox", { name: "Example" });

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(trigger).toHaveTextContent("Beta");

    fireEvent.keyDown(trigger, { key: "g" });
    expect(screen.getByRole("listbox", { name: "Example options" })).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(trigger).toHaveTextContent("Gamma");

    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("listbox", { name: "Example options" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes on an outside pointer without changing the selected value", () => {
    render(<SelectHarness />);
    const trigger = screen.getByRole("combobox", { name: "Example" });

    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("listbox", { name: "Example options" })).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent("Alpha");
  });
});
