"use client";

import Image from "next/image";

import { StackEntry } from "@/components/stack-entry";
import styles from "./contact-hero.module.css";

export function ContactHero() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {/* LEFT — form + newsletter, plain black, no panel chrome */}
        <div className={styles.copyCol}>
          <StackEntry index={0} className={styles.block}>
            <div className={styles.contactBlock}>
              <p className={styles.eyebrow}>Reach Out</p>
              <h1 className={styles.title}>Contact us.</h1>
              <p className={styles.lede}>
                Polytecks is building the next generation of bioelectrical
                sensing. Get in touch about clinical programmes, partnerships,
                or research collaborations.
              </p>
              <form
                className={styles.form}
                onSubmit={(e) => e.preventDefault()}
              >
                <div className={styles.fieldRow}>
                  <Field id="firstName" label="First name" />
                  <Field id="lastName" label="Last name" />
                </div>
                <Field id="email" label="Email" type="email" />
                <div className={styles.fieldRow}>
                  <Field id="jobTitle" label="Job title" />
                  <Field id="company" label="Company" />
                </div>
                <TextareaField id="message" label="Message" />
                <button type="submit" className={styles.submit}>
                  Submit
                </button>
              </form>
            </div>
          </StackEntry>

          <StackEntry index={1} className={styles.block}>
            <div className={styles.newsletterBlock}>
              <p className={styles.eyebrow}>Newsletter</p>
              <h2 className={styles.title}>Stay close to Mosaic.</h2>
              <p className={styles.lede}>
                Early news on clinical programmes, technology releases, and
                partnership opportunities — straight to your inbox.
              </p>
              <form
                className={styles.newsletterForm}
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  name="newsletterEmail"
                  placeholder="your@email.com"
                  required
                  className={styles.newsletterInput}
                />
                <button type="submit" className={styles.subscribe}>
                  Subscribe
                </button>
              </form>
            </div>
          </StackEntry>
        </div>

        {/* RIGHT — empty grid placeholder. Reserves horizontal space so the
            form column doesn't expand into the area where the floating
            image overlay sits. The image itself isn't here. */}
        <div className={styles.imageColPlaceholder} aria-hidden="true" />
      </div>

      {/* Free-floating image overlay — anchored to the right edge of the
          viewport, completely independent of the grid. Spotlight mask is
          on this wrapper so it stays viewport-anchored even when the
          image inside translates. */}
      <div className={styles.imageOverlay} aria-hidden="true">
        <Image
          src="/assets/mosaicvertical.png"
          alt=""
          width={1200}
          height={1200}
          priority
          className={styles.featureImage}
        />
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
      <label htmlFor={id} className={styles.label}>
        {label}*
      </label>
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

function TextareaField({ id, label }: { id: string; label: string }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}*
      </label>
      <textarea
        id={id}
        name={id}
        required
        rows={3}
        className={`${styles.input} ${styles.textarea}`}
        placeholder=" "
      />
    </div>
  );
}
