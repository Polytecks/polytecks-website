"use client";

import Image from "next/image";

import { StackEntry } from "@/components/stack-entry";
import styles from "./contact-hero.module.css";

export function ContactHero() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copyCol}>
          <StackEntry index={0}>
            <p className={styles.eyebrow}>Reach Out</p>
          </StackEntry>
          <StackEntry index={1}>
            <h1 className={styles.title}>
              Stay close to the <em>Mosaic</em> platform.
            </h1>
          </StackEntry>
          <StackEntry index={2}>
            <p className={styles.lede}>
              Polytecks is building the next generation of bioelectrical
              sensing. Join the list to receive early news on clinical
              programmes, new technology releases, and partnership
              opportunities.
            </p>
          </StackEntry>
          <StackEntry index={3}>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.fieldRow}>
                <Field id="firstName" label="First name" />
                <Field id="lastName" label="Last name" />
              </div>
              <Field id="email" label="Email" type="email" />
              <SelectField id="role" label="Select role">
                <option value="" disabled>Select role</option>
                <option value="clinician">Clinician / Medical professional</option>
                <option value="researcher">Researcher / Scientist</option>
                <option value="industry">Industry partner</option>
                <option value="investor">Investor</option>
                <option value="press">Press / Media</option>
                <option value="other">Other</option>
              </SelectField>
              <Field id="location" label="Location" />
              <label className={styles.checkRow}>
                <input type="checkbox" className={styles.checkbox} />
                <span>I&apos;d like to subscribe to the newsletter</span>
              </label>
              <button type="submit" className={styles.submit}>Submit</button>
            </form>
          </StackEntry>
        </div>

        <div className={styles.imageCol}>
          <StackEntry index={1}>
            <Image
              src="/assets/polytecks-arm-v2.png"
              alt="Polytecks hexagonal electrode array on forearm"
              width={1920}
              height={1661}
              className={styles.image}
            />
          </StackEntry>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  type = "text",
}: {
  id: string;
  label: string;
  type?: string;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}*</label>
      <input
        id={id}
        name={id}
        type={type}
        required
        className={styles.input}
        placeholder=" "
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}*</label>
      <select
        id={id}
        name={id}
        required
        defaultValue=""
        className={`${styles.input} ${styles.select}`}
      >
        {children}
      </select>
    </div>
  );
}
