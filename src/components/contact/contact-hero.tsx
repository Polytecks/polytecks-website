"use client";

import { useActionState, useEffect, useRef } from "react";
import { StackEntry } from "@/components/stack-entry";
import {
  submitContactForm,
  type ContactFormState,
} from "@/app/actions/contact";
import {
  subscribeNewsletter,
  type NewsletterFormState,
} from "@/app/actions/newsletter";
import styles from "./contact-hero.module.css";

const CONTACT_IDLE: ContactFormState = { status: "idle" };
const NEWSLETTER_IDLE: NewsletterFormState = { status: "idle" };

export function ContactHero() {
  const [contactState, contactAction, contactPending] = useActionState(
    submitContactForm,
    CONTACT_IDLE,
  );
  const [newsletterState, newsletterAction, newsletterPending] = useActionState(
    subscribeNewsletter,
    NEWSLETTER_IDLE,
  );

  // Reset form fields after a successful submission so the user sees a
  // blank form again (with the success message shown above the submit
  // button). Failed submissions intentionally leave the field values
  // intact so the user can edit and retry.
  const contactFormRef = useRef<HTMLFormElement>(null);
  const newsletterFormRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (contactState.status === "success") contactFormRef.current?.reset();
  }, [contactState]);
  useEffect(() => {
    if (newsletterState.status === "success")
      newsletterFormRef.current?.reset();
  }, [newsletterState]);

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
                ref={contactFormRef}
                className={styles.form}
                action={contactAction}
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
                {/* Honeypot — hidden via CSS, only bots fill it. */}
                <HoneypotField />
                <button
                  type="submit"
                  className={styles.submit}
                  disabled={contactPending}
                >
                  {contactPending ? "Sending…" : "Submit"}
                </button>
                <FormStatus state={contactState} successText="Thanks — we'll be in touch." />
                <p className={styles.emailFallback}>
                  Or email us:{" "}
                  <a
                    className={styles.emailFallbackLink}
                    href="mailto:contact@polytecks.com"
                  >
                    contact@polytecks.com
                  </a>
                </p>
              </form>
            </div>
          </StackEntry>

          <StackEntry index={1} className={styles.block}>
            <div id="newsletter" className={styles.newsletterBlock}>
              <p className={styles.eyebrow}>Newsletter</p>
              <h2 className={styles.title}>Stay close to Mosaic.</h2>
              <p className={styles.lede}>
                Early news on clinical programmes, technology releases, and
                partnership opportunities — straight to your inbox.
              </p>
              <form
                ref={newsletterFormRef}
                className={styles.newsletterForm}
                action={newsletterAction}
              >
                <input
                  type="email"
                  name="newsletterEmail"
                  placeholder="your@email.com"
                  required
                  className={styles.newsletterInput}
                  disabled={newsletterPending}
                />
                <HoneypotField />
                <button
                  type="submit"
                  className={styles.subscribe}
                  disabled={newsletterPending}
                >
                  {newsletterPending ? "Subscribing…" : "Subscribe"}
                </button>
              </form>
              <FormStatus state={newsletterState} successText="You're subscribed." />
              <a
                className={styles.linkedinButton}
                href="https://www.linkedin.com/company/polytecks"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Polytecks on LinkedIn"
              >
                <svg
                  className={styles.linkedinIcon}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" />
                </svg>
                Connect on LinkedIn
              </a>
            </div>
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

/**
 * Off-screen text input that only bots fill in. Server actions drop
 * any submission with a non-empty "website" field silently. aria-hidden
 * + tabIndex=-1 + autoComplete=off keep real users away from it even
 * with a screen reader.
 */
function HoneypotField() {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className={styles.honeypot}
      defaultValue=""
    />
  );
}

function FormStatus({
  state,
  successText,
}: {
  state: ContactFormState | NewsletterFormState;
  successText: string;
}) {
  if (state.status === "success") {
    return (
      <p className={styles.formStatusSuccess} role="status">
        {successText}
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <p className={styles.formStatusError} role="alert">
        {state.message}
      </p>
    );
  }
  return null;
}
