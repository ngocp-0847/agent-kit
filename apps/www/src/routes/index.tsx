import type { Component } from "solid-js";
import { Title } from "@solidjs/meta";
import {
  HeroSection,
  FeaturesSection,
  CommandsSection,
  InstallSection,
  CTASection,
} from "../components/sections";

const HomePage: Component = () => {
  return (
    <>
      <Title>Cursor Kit - Supercharge your AI IDE with rules & commands</Title>
      <HeroSection />
      <FeaturesSection />
      <CommandsSection />
      <InstallSection />
      <CTASection />
    </>
  );
};

export default HomePage;