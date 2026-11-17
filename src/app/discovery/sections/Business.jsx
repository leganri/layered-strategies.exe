"use client";
import React from "react";
import { Field, AF, Chips, Box } from "../ui/controls";
import { MODELS, STAGES } from "../content/options";

export default function Business() {
  return (
    <>
      <Box title="The strategic question">
        <AF path="business.scq.situation" rows={2} />
        <AF path="business.scq.complication" rows={2} />
        <AF path="business.scq.question" rows={2} ph="How do we ___?" />
      </Box>
      <AF path="business.oneLiner" rows={2} ph="We make / sell / run ___ for ___." />
      <Field path="business.model"><Chips path="business.model" options={MODELS} /></Field>
      <Field path="business.stage"><Chips path="business.stage" options={STAGES} multi={false} /></Field>
      <AF path="business.revenue" ph="Primary and secondary revenue, pricing logic" />
      <AF path="business.ambition" />
      <AF path="business.metrics" rows={2} ph="e.g. ticket conversion, average order value, inbound quality" />
    </>
  );
}
