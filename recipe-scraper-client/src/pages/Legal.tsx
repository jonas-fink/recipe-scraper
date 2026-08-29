// ponytail: alle drei Rechtstexte in einer Datei; aufteilen wenn sie wirklich wachsen.
// PLATZHALTER: alle [[...]] Felder vor dem Livegang ausfüllen.

const CONTACT_EMAIL = '[[kontakt@deine-domain.de]]';

const Page = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <article className="w-full max-w-3xl px-4 py-8 font-sans text-text flex flex-col gap-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_p]:text-text-muted [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-text-muted [&_a]:text-primary [&_a]:underline">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {children}
    </article>
);

export const Impressum = () => (
    <Page title="Impressum">
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
            [[Vorname Nachname / Firmenname]]
            <br />
            [[Straße und Hausnummer]]
            <br />
            [[PLZ Ort]]
            <br />
            [[Land]]
        </p>

        <h2>Kontakt</h2>
        <p>
            Telefon: [[+49 ...]]
            <br />
            E-Mail: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>

        <h2>Umsatzsteuer-ID</h2>
        <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: [[DE...]]
            <br />
            (entfällt bei Kleinunternehmern nach § 19 UStG)
        </p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
            [[Vorname Nachname]]
            <br />
            [[Straße, PLZ Ort]]
        </p>

        <h2>Streitschlichtung</h2>
        <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
    </Page>
);

export const Datenschutz = () => (
    <Page title="Datenschutzerklärung">
        <h2>1. Verantwortlicher</h2>
        <p>
            [[Vorname Nachname / Firmenname]], [[Straße]], [[PLZ Ort]],{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <br />
            Datenschutzbeauftragter: [[Name oder „nicht bestellt“]]
        </p>

        <h2>2. Welche Daten wir verarbeiten</h2>
        <ul>
            <li>
                <strong>Konto:</strong> Name, E-Mail-Adresse und ein gehashtes
                Passwort, um dich anzumelden (Art. 6 Abs. 1 lit. b DSGVO –
                Vertragserfüllung).
            </li>
            <li>
                <strong>Inhalte:</strong> von dir gespeicherte Rezepte,
                Einkaufslisten und – falls du sie veröffentlichst – dein
                Anzeigename in der Community (Art. 6 Abs. 1 lit. b DSGVO).
            </li>
            <li>
                <strong>Server-Logs:</strong> IP-Adresse, Zeitpunkt, aufgerufene
                URL und User-Agent zur Absicherung des Betriebs (Art. 6 Abs. 1
                lit. f DSGVO – berechtigtes Interesse), Speicherdauer
                [[z. B. 7 Tage]].
            </li>
            <li>
                <strong>Technisch notwendige Cookies / Local Storage:</strong>{' '}
                ein Anmelde-Token, damit du eingeloggt bleibst. Kein Tracking,
                keine Werbe-Cookies, daher kein Cookie-Banner.
            </li>
        </ul>

        <h2>3. Empfänger und Drittlandtransfer</h2>
        <ul>
            <li>
                <strong>Hosting:</strong> [[Anbieter, Sitz]] als
                Auftragsverarbeiter (Art. 28 DSGVO).
            </li>
            <li>
                <strong>Datenbank:</strong> [[z. B. MongoDB Atlas, Region]].
            </li>
            <li>
                <strong>Rezept-Auswertung:</strong> Wenn du eine Rezept-URL
                importierst, wird der öffentlich abrufbare Rezepttext der
                Quellseite zur Strukturierung an [[Google Gemini API, Google
                Ireland Ltd.]] übermittelt. Personenbezogene Daten von dir werden
                dabei nicht übertragen. Übermittlung in Drittländer erfolgt auf
                Grundlage der EU-Standardvertragsklauseln.
            </li>
        </ul>

        <h2>4. Speicherdauer</h2>
        <p>
            Kontodaten und Inhalte werden gespeichert, bis du dein Konto löschst
            oder deren Löschung verlangst. Danach werden sie unverzüglich
            entfernt, soweit keine gesetzlichen Aufbewahrungspflichten bestehen.
        </p>

        <h2>5. Deine Rechte</h2>
        <p>
            Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16),
            Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
            Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO).
            Erteilte Einwilligungen kannst du jederzeit mit Wirkung für die
            Zukunft widerrufen. Melde dich dafür an{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>6. Beschwerderecht</h2>
        <p>
            Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren,
            zuständig ist [[zuständige Landesbehörde, z. B. LfDI
            Baden-Württemberg]].
        </p>

        <h2>7. Keine automatisierte Entscheidungsfindung</h2>
        <p>
            Es findet keine automatisierte Entscheidungsfindung oder Profiling im
            Sinne von Art. 22 DSGVO statt.
        </p>

        <p className="text-sm">Stand: [[Monat Jahr]]</p>
    </Page>
);

export const Kontakt = () => (
    <Page title="Kontakt & Feedback">
        <p>
            Fehler gefunden, Rezeptquelle funktioniert nicht oder du hast einen
            Wunsch? Schreib uns – wir lesen jede Nachricht.
        </p>
        <p>
            <a
                href={`mailto:${CONTACT_EMAIL}?subject=Reciply%20Feedback`}
                className="inline-block rounded-md border border-border-strong bg-surface px-4 py-2 font-semibold no-underline hover:bg-elevated"
            >
                {CONTACT_EMAIL}
            </a>
        </p>
        <p>
            Postanschrift und weitere Angaben findest du im{' '}
            <a href="/impressum">Impressum</a>. Anfragen zum Datenschutz
            beantworten wir innerhalb eines Monats (Art. 12 Abs. 3 DSGVO).
        </p>
    </Page>
);
