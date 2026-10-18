import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const COUNTDOWN = `; count down from 3
ps3 #0 3          ; Plant Seed: cell #0 = 3
@again:
jz1 #0 @done      ; Jump if Zero
ad3 #0            ; Announce Digit
ad1 #0 -1         ; Add Digits
ps2 @again        ; Pounce Somewhere
@done:
ps1 "Liftoff!"    ; Print String`;

const FEATURES = [
  {
    emoji: '🔀',
    title: 'Same letters, different jobs',
    text: 'ps1 prints. ps2 jumps. ps3 stores a value. ps4 adds to a list. The letters never help you, and that is a rule.',
    link: '/docs/language/the-chaos-rule',
  },
  {
    emoji: '😡',
    title: 'It has feelings',
    text: 'Too many jumps make Twist dizzy. Divide by zero and it gets furious, starts SHOUTING, and refuses some of your instructions.',
    link: '/docs/tutorial/mood',
  },
  {
    emoji: '🔄',
    title: 'It fights back',
    text: 'sw1 swaps what two instructions do. rv1 makes your program run upward. rd2 rolls dice. Good luck.',
    link: '/docs/tutorial/swap-words',
  },
  {
    emoji: '🧪',
    title: 'Actually works',
    text: 'Turing complete, with decimals, text, lists, functions and recursion. 42 instructions, and hundreds of tests.',
    link: '/docs/reference/instructions',
  },
];

const STATS = [
  ['42', 'instructions'],
  ['9', 'categories'],
  ['7', 'moods'],
  ['0', 'dependencies'],
];

function Hero() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className="container">
        <Heading as="h1" className={styles.logo}>
          <span>t</span>
          <span>w</span>
          <span className={styles.spin}>i</span>
          <span>s</span>
          <span>t</span>
        </Heading>
        <p className={styles.tagline}>{siteConfig.tagline}</p>
        <p className={styles.subtitle}>
          A tiny, chaotic programming language where <code>ps1</code> and <code>ps2</code> have{' '}
          <strong>nothing</strong> to do with each other.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/tutorial/hello">
            Learn Twist in 15 minutes
          </Link>
          <Link className="button button--secondary button--lg" href="pathname:///play/playground/">
            Open the playground
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout title="Home" description="Twist: a tiny, chaotic programming language where ps1 and ps2 mean totally different things.">
      <Hero />
      <main>
        <section className={styles.sample}>
          <div className="container">
            <div className="row">
              <div className="col col--6">
                <Heading as="h2">Read it out loud</Heading>
                <p>
                  Every instruction is two letters and a number, with a silly full name that explains it after the
                  fact. <code>ps3</code> is <strong>P</strong>lant <strong>S</strong>eed. <code>ps2</code> is{' '}
                  <strong>P</strong>ounce <strong>S</strong>omewhere. They are not related.
                </p>
                <p>
                  Labels like <code>@again:</code> mark spots to jump to, and cells like <code>#0</code> hold
                  numbers, text or lists.
                </p>
                <Link to="/docs/intro">What is Twist? →</Link>
              </div>
              <div className="col col--6">
                <CodeBlock language="twist" title="countdown.twist">
                  {COUNTDOWN}
                </CodeBlock>
                <CodeBlock language="text" title="output">
                  {'3\n2\n1\nLiftoff!'}
                </CodeBlock>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {FEATURES.map(({ emoji, title, text, link }) => (
                <div key={title} className="col col--3">
                  <Link to={link} className={styles.card}>
                    <div className={styles.emoji}>{emoji}</div>
                    <Heading as="h3">{title}</Heading>
                    <p>{text}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.stats}>
          <div className="container">
            <div className={styles.statRow}>
              {STATS.map(([number, label]) => (
                <div key={label} className={styles.stat}>
                  <div className={styles.statNumber}>{number}</div>
                  <div className={styles.statLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className="container">
            <Heading as="h2">Ready to be confused?</Heading>
            <div className={styles.buttons}>
              <Link className="button button--primary button--lg" to="/docs/getting-started/installation">
                Install Twist
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/examples">
                See examples
              </Link>
              <Link className="button button--secondary button--lg" to="/blog">
                Read the dev log
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
