import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders MediBox headline", () => {
    render(<App />);
    expect(screen.getByText(/Smart IoT Pillbox/i)).toBeInTheDocument();
  });
});
