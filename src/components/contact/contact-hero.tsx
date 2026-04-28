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
              <Field id="jobTitle" label="Job title" />
              <Field id="company" label="Company" />
              <TextareaField id="message" label="Message" />
              <button type="submit" className={styles.submit}>Submit</button>
            </form>
          </StackEntry>
        </div>

        <div className={styles.imageCol}>
          <StackEntry index={1}>
            <Image
              src="/assets/transparentform.png"
              alt="Polytecks Mosaic platform — sensor in glove"
              width={1600}
              height={1200}
              className={styles.image}
              priority
              unoptimized
            />
          </StackEntry>
        </div>
      </div>

      <div className={styles.newsletterInner}>
        <StackEntry index={4}>
          <p className={styles.newsletterEyebrow}>Newsletter</p>
        </StackEntry>
        <StackEntry index={5}>
          <h2 className={styles.newsletterTitle}>Stay in the loop.</h2>
        </StackEntry>
        <StackEntry index={6}>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.newsletterRow}>
              <input
                type="email"
                name="newsletterEmail"
                placeholder="your@email.com"
                required
                className={`${styles.input} ${styles.newsletterInput}`}
              />
              <button type="submit" className={styles.submit}>Subscribe</button>
            </div>
          </form>
        </StackEntry>
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

function TextareaField({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}*</label>
      <textarea
        id={id}
        name={id}
        required
        rows={4}
        className={`${styles.input} ${styles.textarea}`}
        placeholder=" "
      />
    </div>
  );
}
