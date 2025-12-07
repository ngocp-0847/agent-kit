import type { ParentComponent } from "solid-js";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout: ParentComponent = (props) => {
  return (
    <div class="min-h-screen flex flex-col">
      <Header />
      <main class="flex-1 pt-20">{props.children}</main>
      <Footer />
    </div>
  );
};
