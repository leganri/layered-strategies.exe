"use client";
import React from "react";
import { Field, TF, Chips, Box } from "../ui/controls";
import { ENGAGEMENTS } from "../content/options";

export default function Setup() {
  return (
    <>
      <div className="grid2">
        <TF path="setup.client" ph="Company or organization" />
        <TF path="setup.project" ph="Working title" />
        <TF path="setup.date" mono />
        <TF path="setup.facilitator" ph="Who runs the room" />
        <TF path="setup.sector" ph="e.g. Hospitality, Web3 events, DTC food" />
        <TF path="setup.attendees" ph="Names and roles" />
      </div>
      <Field path="setup.engagement"><Chips path="setup.engagement" options={ENGAGEMENTS} /></Field>
      <Box title="Decision rights">
        <TF path="setup.decider" ph="Who signs off" />
        <TF path="setup.approvers" ph="Who has to say yes first" />
        <TF path="setup.input" ph="Who advises" />
      </Box>
    </>
  );
}
