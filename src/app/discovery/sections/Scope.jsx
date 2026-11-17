"use client";
import React from "react";
import { Field, AF, TF, Chips } from "../ui/controls";
import { DELIVERABLES, BUDGETS } from "../content/options";
import { AssumptionsRegister } from "../ui/Validate";

export default function Scope() {
  return (
    <>
      <Field path="scope.deliverables"><Chips path="scope.deliverables" options={DELIVERABLES} /></Field>
      <div className="grid2">
        <TF path="scope.timeline" ph="Key dates, hard deadlines" />
        <Field path="scope.budget"><Chips path="scope.budget" options={BUDGETS} multi={false} /></Field>
      </div>
      <AF path="scope.risks" />
      <AF path="scope.notes" />
      <AF path="scope.openQuestions" rows={3} />
      <AF path="scope.nextSteps" rows={3} ph="Name: action by date" />
      <AssumptionsRegister />
    </>
  );
}
