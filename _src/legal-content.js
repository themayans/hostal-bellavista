/* Legal page copy, in all five site languages.
 *
 * ⚠ THESE ARE DRAFTS, NOT LEGAL ADVICE. They were written to close the
 * compliance gap left by the old site (which had a cookie banner whose
 * "Read more" link was broken and no policy pages at all). Spanish law
 * (LSSI-CE 34/2002 art. 10) and the GDPR both require this information.
 *
 * Before going live, a Spanish lawyer or gestoría must review them and the
 * placeholders in COMPANY below must be filled with the real registered
 * details. Every page renders a visible "draft" banner until you set
 * DRAFT = false at the bottom of this file.
 *
 * Read by scripts/build-legal.js — never shipped to the browser.
 */

/* Identity taken from the property's OWN published privacy policy
   (hostal-bellavista.com/backoffice/pdf/files/1privacidad_es.pdf), which
   states verbatim: "Nuestra denominación: HOSTAL BELLAVISTA CB" and
   "Nuestro CIF / NIF: E57315962".

   ⚠ TWO UNRESOLVED CONFLICTS — the owner must confirm before publication:
   1. The Amenitiz booking engine's legal page names a DIFFERENT titular,
      "FRANCISCO MAYANS TUR", with no NIF. Likely a comunero of the CB, but
      which entity is the data controller must be confirmed.
   2. The postal address differs across all three sources: the current site
      says "Polígon de la Marina, 8"; the privacy PDF says "Puerto la Savina,
      8 oaseo la marina" (corrupted, with literal "undefined" strings from a
      broken CMS merge); Amenitiz says "PASEO DE LA MARINA 8". We use the
      form the property publishes on its own site.

   ⚠ STILL MISSING: the Registro de Turismo number. It is legally required in
   the Illes Balears and is blank in every source. See HANDOVER.md. */
const COMPANY = {
  tradeName:  "Hostal Restaurante Bellavista",
  legalName:  "HOSTAL BELLAVISTA C.B.",
  taxId:      "E57315962",
  address:    "Polígon de la Marina, 8, 07870 La Savina, Formentera, Illes Balears, España",
  registry:   "«Número de Registro de Turismo de les Illes Balears — pendiente»",
  email:      "reservas@hostal-bellavista.com",
  phone:      "+34 971 323 324",
  updated:    "2026-08-09"
};

const DRAFT = true;   // set to false once a lawyer has approved the texts

/* Each document is: { title, intro, sections: [{ h, body: [paragraph|["li",…]] }] } */
const LEGAL = {

/* ============================== ESPAÑOL ============================== */
es: {
  _ui: { updated: "Última actualización", draft: "Borrador pendiente de revisión legal.", draftBody: "Este texto se ha redactado como punto de partida y todavía no ha sido revisado por un abogado. No lo publique como definitivo sin esa revisión y sin completar los datos identificativos marcados.", home: "Volver al inicio" },

  privacy: {
    title: "Política de privacidad",
    intro: "Esta política explica qué datos personales tratamos cuando usted nos escribe o reserva, con qué finalidad y qué derechos tiene sobre ellos.",
    sections: [
      { h: "Responsable del tratamiento", body: [
        `${COMPANY.legalName} (nombre comercial ${COMPANY.tradeName}), con NIF ${COMPANY.taxId} y domicilio en ${COMPANY.address}. Correo electrónico: ${COMPANY.email}. Teléfono: ${COMPANY.phone}.`
      ]},
      { h: "Qué datos tratamos y por qué", body: [
        "Cuando usted rellena el formulario de contacto de esta web, tratamos el nombre, el correo electrónico, el teléfono si lo facilita y el contenido de su mensaje, junto con las fechas y el número de huéspedes si los ha seleccionado.",
        "La finalidad es únicamente atender su consulta o su solicitud de reserva y responderle. No elaboramos perfiles ni tomamos decisiones automatizadas.",
        "La base jurídica es su consentimiento y, cuando la consulta va dirigida a formalizar una reserva, la aplicación de medidas precontractuales a petición suya."
      ]},
      { h: "Quién recibe sus datos", body: [
        "Esta web es un sitio estático y no dispone de base de datos propia: no almacenamos su mensaje en este servidor.",
        ["El formulario se envía a través de FormSubmit (formsubmit.co), que transmite el contenido a nuestro correo electrónico y actúa como encargado del tratamiento.",
         "Las reservas en firme se gestionan a través de nuestro motor de reservas, Amenitiz, con su propia política de privacidad.",
         "El correo electrónico se aloja en el proveedor de correo del establecimiento."],
        "No cedemos sus datos a terceros con fines comerciales ni realizamos transferencias internacionales más allá de las que impliquen los proveedores citados."
      ]},
      { h: "Cuánto tiempo los conservamos", body: [
        "Conservamos los mensajes el tiempo necesario para atender su consulta y, después, durante el plazo en que puedan derivarse responsabilidades legales. Los datos de una reserva se conservan según la normativa fiscal y de registro de viajeros aplicable."
      ]},
      { h: "Sus derechos", body: [
        "Puede solicitar el acceso a sus datos, su rectificación o supresión, la limitación u oposición al tratamiento y la portabilidad, escribiendo a " + COMPANY.email + " e indicando su petición.",
        "Si considera que no hemos atendido correctamente su solicitud, puede reclamar ante la Agencia Española de Protección de Datos (www.aepd.es)."
      ]}
    ]
  },

  cookies: {
    title: "Política de cookies",
    intro: "Esta web se ha construido de forma deliberadamente sencilla: no utiliza cookies de análisis, de publicidad ni de seguimiento.",
    sections: [
      { h: "Qué usamos", body: [
        "No instalamos cookies publicitarias ni analíticas, y no hay herramientas de seguimiento de terceros en estas páginas. Por eso no verá un banner de consentimiento: no hay nada que consentir.",
        "Utilizamos únicamente un dato de almacenamiento local del navegador (localStorage), llamado bv_lang, que guarda el idioma que usted elige para no volver a preguntárselo en la siguiente visita. Es técnicamente necesario para esa función, no identifica a la persona y puede borrarlo en cualquier momento desde los ajustes de su navegador."
      ]},
      { h: "Servicios externos", body: [
        ["El mapa de la página de contacto se muestra mediante un iframe de Google Maps. Al cargarlo, Google puede instalar sus propias cookies y recibir su dirección IP, conforme a su política de privacidad.",
         "Las tipografías se sirven desde Google Fonts.",
         "Al pulsar «Reservar» abandona esta web y accede a nuestro motor de reservas, que aplica su propia política de cookies."]
      ]},
      { h: "Cómo controlarlas", body: [
        "Puede bloquear o eliminar cookies y datos de sitios desde la configuración de su navegador. Hacerlo no impedirá el uso de esta web; como mucho, dejaremos de recordar su idioma."
      ]}
    ]
  },

  notice: {
    title: "Aviso legal",
    intro: "Información general exigida por la Ley 34/2002 de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE).",
    sections: [
      { h: "Datos identificativos", body: [
        `Titular: ${COMPANY.legalName} (nombre comercial ${COMPANY.tradeName}).`,
        `NIF: ${COMPANY.taxId}. Domicilio: ${COMPANY.address}.`,
        `Contacto: ${COMPANY.email} · ${COMPANY.phone}.`,
        COMPANY.registry
      ]},
      { h: "Objeto", body: [
        "Este sitio web tiene por finalidad ofrecer información sobre el hostal y el restaurante y facilitar la consulta y la reserva de sus servicios."
      ]},
      { h: "Condiciones de uso", body: [
        "El acceso a este sitio es gratuito. El usuario se compromete a hacer un uso adecuado de sus contenidos y a no emplearlos con fines ilícitos o lesivos para terceros."
      ]},
      { h: "Propiedad intelectual", body: [
        "Los textos, las fotografías y el diseño de este sitio son titularidad del establecimiento o se utilizan con autorización. No se permite su reproducción o distribución sin consentimiento previo."
      ]},
      { h: "Responsabilidad", body: [
        "Procuramos que la información publicada sea exacta y esté actualizada, pero los precios, los horarios y la disponibilidad pueden variar. La información contractual vinculante es la que figure en la confirmación de su reserva.",
        "No nos hacemos responsables del contenido de los sitios de terceros enlazados desde estas páginas."
      ]},
      { h: "Legislación aplicable", body: [
        "Esta relación se rige por la legislación española. Para cualquier controversia serán competentes los juzgados y tribunales que correspondan conforme a derecho."
      ]}
    ]
  }
},

/* ============================== ENGLISH ============================== */
en: {
  _ui: { updated: "Last updated", draft: "Draft pending legal review.", draftBody: "This text was written as a starting point and has not yet been reviewed by a lawyer. Do not treat it as final until it has been reviewed and the marked company details have been completed.", home: "Back to the homepage" },

  privacy: {
    title: "Privacy policy",
    intro: "This policy explains what personal data we handle when you write to us or book, why we handle it, and what rights you have over it.",
    sections: [
      { h: "Data controller", body: [
        `${COMPANY.legalName} (trading as ${COMPANY.tradeName}), tax ID ${COMPANY.taxId}, registered at ${COMPANY.address}. Email: ${COMPANY.email}. Phone: ${COMPANY.phone}.`
      ]},
      { h: "What we process, and why", body: [
        "When you complete the contact form on this site we process your name, email address, phone number if you give one, and the content of your message, together with the dates and number of guests if you selected them.",
        "The sole purpose is to answer your enquiry or booking request. We do not build profiles and we make no automated decisions.",
        "The legal basis is your consent and, where the enquiry is aimed at making a booking, pre-contractual steps taken at your request."
      ]},
      { h: "Who receives your data", body: [
        "This is a static website with no database of its own: your message is not stored on this server.",
        ["The form is delivered through FormSubmit (formsubmit.co), which passes the content to our email address and acts as a data processor.",
         "Confirmed bookings are handled by our reservation engine, Amenitiz, under its own privacy policy.",
         "Email is hosted with the property's mail provider."],
        "We do not sell or share your data with third parties for marketing, and we make no international transfers beyond those involved in the services named above."
      ]},
      { h: "How long we keep it", body: [
        "We keep enquiries for as long as is needed to deal with them and afterwards for the period in which legal claims could arise. Booking data is kept in line with the applicable tax and traveller-registration rules."
      ]},
      { h: "Your rights", body: [
        "You may request access to your data, its correction or erasure, restriction of or objection to processing, and portability, by writing to " + COMPANY.email + " and stating your request.",
        "If you believe your request has not been handled properly, you may complain to the Spanish Data Protection Agency (www.aepd.es)."
      ]}
    ]
  },

  cookies: {
    title: "Cookie policy",
    intro: "This site was built deliberately simply: it uses no analytics, advertising or tracking cookies.",
    sections: [
      { h: "What we use", body: [
        "We set no advertising or analytics cookies, and there are no third-party tracking tools on these pages. That is why you will not see a consent banner — there is nothing to consent to.",
        "We use one piece of browser local storage, called bv_lang, which remembers the language you choose so we do not have to ask again on your next visit. It is strictly necessary for that function, does not identify you, and you can clear it at any time from your browser settings."
      ]},
      { h: "External services", body: [
        ["The map on the contact section is embedded from Google Maps. Loading it may allow Google to set its own cookies and to receive your IP address, under its privacy policy.",
         "Typefaces are served from Google Fonts.",
         "Clicking “Book” takes you off this site to our reservation engine, which applies its own cookie policy."]
      ]},
      { h: "How to control them", body: [
        "You can block or delete cookies and site data in your browser settings. Doing so will not stop you using this site; at most, we will no longer remember your language."
      ]}
    ]
  },

  notice: {
    title: "Legal notice",
    intro: "General information required by Spanish Law 34/2002 on information society services and electronic commerce (LSSI-CE).",
    sections: [
      { h: "Identification", body: [
        `Owner: ${COMPANY.legalName} (trading as ${COMPANY.tradeName}).`,
        `Tax ID: ${COMPANY.taxId}. Registered address: ${COMPANY.address}.`,
        `Contact: ${COMPANY.email} · ${COMPANY.phone}.`,
        COMPANY.registry
      ]},
      { h: "Purpose", body: [
        "This website exists to provide information about the hostal and the restaurant and to make it easy to enquire about and book their services."
      ]},
      { h: "Terms of use", body: [
        "Access to this site is free of charge. Users undertake to make proper use of its contents and not to use them for unlawful purposes or in ways harmful to others."
      ]},
      { h: "Intellectual property", body: [
        "The texts, photographs and design of this site belong to the property or are used with permission. They may not be reproduced or distributed without prior consent."
      ]},
      { h: "Liability", body: [
        "We aim to keep the published information accurate and current, but prices, opening hours and availability may change. The binding contractual information is that shown in your booking confirmation.",
        "We are not responsible for the content of third-party sites linked from these pages."
      ]},
      { h: "Applicable law", body: [
        "This relationship is governed by Spanish law. Any dispute will be heard by the courts having jurisdiction under the applicable rules."
      ]}
    ]
  }
},

/* ============================== ITALIANO ============================= */
it: {
  _ui: { updated: "Ultimo aggiornamento", draft: "Bozza in attesa di revisione legale.", draftBody: "Questo testo è stato redatto come punto di partenza e non è ancora stato verificato da un avvocato. Non consideratelo definitivo prima di tale revisione e del completamento dei dati identificativi indicati.", home: "Torna alla home" },

  privacy: {
    title: "Informativa sulla privacy",
    intro: "Questa informativa spiega quali dati personali trattiamo quando ci scrivete o prenotate, con quale finalità e quali diritti avete.",
    sections: [
      { h: "Titolare del trattamento", body: [
        `${COMPANY.legalName} (nome commerciale ${COMPANY.tradeName}), codice fiscale ${COMPANY.taxId}, con sede in ${COMPANY.address}. Email: ${COMPANY.email}. Telefono: ${COMPANY.phone}.`
      ]},
      { h: "Quali dati trattiamo e perché", body: [
        "Quando compilate il modulo di contatto trattiamo nome, indirizzo email, telefono se lo indicate e il contenuto del messaggio, insieme alle date e al numero di ospiti se li avete selezionati.",
        "La finalità è unicamente rispondere alla vostra richiesta di informazioni o di prenotazione. Non effettuiamo profilazione né decisioni automatizzate.",
        "La base giuridica è il vostro consenso e, quando la richiesta è finalizzata a una prenotazione, le misure precontrattuali adottate su vostra richiesta."
      ]},
      { h: "Chi riceve i vostri dati", body: [
        "Questo è un sito statico e non dispone di un database proprio: il vostro messaggio non viene conservato su questo server.",
        ["Il modulo viene inviato tramite FormSubmit (formsubmit.co), che trasmette il contenuto al nostro indirizzo email e agisce come responsabile del trattamento.",
         "Le prenotazioni confermate sono gestite dal nostro motore di prenotazione, Amenitiz, con la propria informativa.",
         "La posta elettronica è ospitata presso il provider di posta della struttura."],
        "Non cediamo i vostri dati a terzi per finalità commerciali e non effettuiamo trasferimenti internazionali oltre a quelli implicati dai servizi citati."
      ]},
      { h: "Per quanto tempo li conserviamo", body: [
        "Conserviamo i messaggi per il tempo necessario a dare riscontro e successivamente per il periodo in cui possano sorgere responsabilità legali. I dati di prenotazione sono conservati secondo la normativa fiscale e di registrazione dei viaggiatori applicabile."
      ]},
      { h: "I vostri diritti", body: [
        "Potete richiedere l'accesso ai vostri dati, la rettifica o la cancellazione, la limitazione o l'opposizione al trattamento e la portabilità, scrivendo a " + COMPANY.email + " e indicando la vostra richiesta.",
        "Se ritenete che la richiesta non sia stata gestita correttamente, potete rivolgervi all'Autorità spagnola per la protezione dei dati (www.aepd.es)."
      ]}
    ]
  },

  cookies: {
    title: "Politica dei cookie",
    intro: "Questo sito è stato costruito volutamente in modo semplice: non utilizza cookie di analisi, pubblicitari o di tracciamento.",
    sections: [
      { h: "Che cosa utilizziamo", body: [
        "Non installiamo cookie pubblicitari o analitici e su queste pagine non ci sono strumenti di tracciamento di terze parti. Per questo non vedrete un banner di consenso: non c'è nulla da acconsentire.",
        "Utilizziamo un solo dato di archiviazione locale del browser (localStorage), chiamato bv_lang, che ricorda la lingua scelta per non doverla richiedere alla visita successiva. È tecnicamente necessario a tale funzione, non identifica la persona e potete cancellarlo in qualsiasi momento dalle impostazioni del browser."
      ]},
      { h: "Servizi esterni", body: [
        ["La mappa nella sezione contatti è incorporata da Google Maps. Caricandola, Google può installare i propri cookie e ricevere il vostro indirizzo IP, secondo la propria informativa.",
         "I caratteri tipografici sono serviti da Google Fonts.",
         "Premendo «Prenota» lasciate questo sito e accedete al nostro motore di prenotazione, che applica la propria politica dei cookie."]
      ]},
      { h: "Come controllarli", body: [
        "Potete bloccare o eliminare cookie e dati dei siti dalle impostazioni del browser. Ciò non vi impedirà di usare questo sito; al massimo non ricorderemo più la vostra lingua."
      ]}
    ]
  },

  notice: {
    title: "Note legali",
    intro: "Informazioni generali richieste dalla legge spagnola 34/2002 sui servizi della società dell'informazione e sul commercio elettronico (LSSI-CE).",
    sections: [
      { h: "Dati identificativi", body: [
        `Titolare: ${COMPANY.legalName} (nome commerciale ${COMPANY.tradeName}).`,
        `Codice fiscale: ${COMPANY.taxId}. Sede: ${COMPANY.address}.`,
        `Contatti: ${COMPANY.email} · ${COMPANY.phone}.`,
        COMPANY.registry
      ]},
      { h: "Oggetto", body: [
        "Questo sito ha lo scopo di fornire informazioni sull'hostal e sul ristorante e di agevolare le richieste e le prenotazioni dei loro servizi."
      ]},
      { h: "Condizioni d'uso", body: [
        "L'accesso al sito è gratuito. L'utente si impegna a farne un uso corretto e a non utilizzarne i contenuti per finalità illecite o lesive di terzi."
      ]},
      { h: "Proprietà intellettuale", body: [
        "I testi, le fotografie e il progetto grafico del sito appartengono alla struttura o sono utilizzati con autorizzazione. Non ne è consentita la riproduzione o la distribuzione senza previo consenso."
      ]},
      { h: "Responsabilità", body: [
        "Ci impegniamo a mantenere le informazioni accurate e aggiornate, ma prezzi, orari e disponibilità possono variare. Le informazioni contrattuali vincolanti sono quelle riportate nella conferma di prenotazione.",
        "Non rispondiamo dei contenuti dei siti di terzi collegati da queste pagine."
      ]},
      { h: "Legge applicabile", body: [
        "Il rapporto è regolato dalla legge spagnola. Per ogni controversia saranno competenti i tribunali individuati secondo le norme applicabili."
      ]}
    ]
  }
},

/* =============================== DEUTSCH ============================= */
de: {
  _ui: { updated: "Zuletzt aktualisiert", draft: "Entwurf, juristische Prüfung ausstehend.", draftBody: "Dieser Text wurde als Ausgangspunkt verfasst und ist noch nicht anwaltlich geprüft. Betrachten Sie ihn nicht als endgültig, bevor diese Prüfung erfolgt ist und die markierten Unternehmensangaben ergänzt wurden.", home: "Zurück zur Startseite" },

  privacy: {
    title: "Datenschutzerklärung",
    intro: "Diese Erklärung beschreibt, welche personenbezogenen Daten wir verarbeiten, wenn Sie uns schreiben oder buchen, zu welchem Zweck und welche Rechte Sie haben.",
    sections: [
      { h: "Verantwortlicher", body: [
        `${COMPANY.legalName} (Handelsname ${COMPANY.tradeName}), Steuernummer ${COMPANY.taxId}, Anschrift ${COMPANY.address}. E-Mail: ${COMPANY.email}. Telefon: ${COMPANY.phone}.`
      ]},
      { h: "Welche Daten wir verarbeiten und warum", body: [
        "Wenn Sie das Kontaktformular ausfüllen, verarbeiten wir Ihren Namen, Ihre E-Mail-Adresse, gegebenenfalls Ihre Telefonnummer und den Inhalt Ihrer Nachricht sowie die gewählten Daten und die Gästezahl.",
        "Zweck ist ausschließlich die Beantwortung Ihrer Anfrage oder Buchungsanfrage. Wir erstellen keine Profile und treffen keine automatisierten Entscheidungen.",
        "Rechtsgrundlage ist Ihre Einwilligung und, soweit die Anfrage auf eine Buchung zielt, vorvertragliche Maßnahmen auf Ihre Anfrage hin."
      ]},
      { h: "Wer Ihre Daten erhält", body: [
        "Dies ist eine statische Website ohne eigene Datenbank: Ihre Nachricht wird auf diesem Server nicht gespeichert.",
        ["Das Formular wird über FormSubmit (formsubmit.co) zugestellt, das den Inhalt an unsere E-Mail-Adresse weiterleitet und als Auftragsverarbeiter tätig wird.",
         "Bestätigte Buchungen werden über unser Buchungssystem Amenitiz abgewickelt, das eine eigene Datenschutzerklärung hat.",
         "Die E-Mail wird beim Mailprovider des Hauses gehostet."],
        "Wir geben Ihre Daten nicht zu Werbezwecken an Dritte weiter und nehmen keine Übermittlungen in Drittländer vor, die über die genannten Dienste hinausgehen."
      ]},
      { h: "Speicherdauer", body: [
        "Wir bewahren Anfragen so lange auf, wie es für deren Bearbeitung erforderlich ist, und anschließend für den Zeitraum möglicher Rechtsansprüche. Buchungsdaten werden nach den geltenden steuer- und meldrechtlichen Vorgaben aufbewahrt."
      ]},
      { h: "Ihre Rechte", body: [
        "Sie können Auskunft, Berichtigung oder Löschung Ihrer Daten, Einschränkung oder Widerspruch gegen die Verarbeitung sowie Datenübertragbarkeit verlangen — schreiben Sie dazu an " + COMPANY.email + ".",
        "Wenn Sie meinen, Ihr Anliegen sei nicht ordnungsgemäß bearbeitet worden, können Sie sich an die spanische Datenschutzbehörde wenden (www.aepd.es)."
      ]}
    ]
  },

  cookies: {
    title: "Cookie-Richtlinie",
    intro: "Diese Website wurde bewusst einfach gebaut: Sie verwendet keine Analyse-, Werbe- oder Tracking-Cookies.",
    sections: [
      { h: "Was wir verwenden", body: [
        "Wir setzen keine Werbe- oder Analyse-Cookies, und auf diesen Seiten gibt es keine Tracking-Werkzeuge Dritter. Deshalb sehen Sie kein Einwilligungsbanner — es gibt nichts einzuwilligen.",
        "Wir nutzen einen einzigen Eintrag im lokalen Speicher des Browsers (localStorage) namens bv_lang, der die von Ihnen gewählte Sprache merkt. Er ist für diese Funktion technisch notwendig, identifiziert Sie nicht und kann jederzeit in den Browsereinstellungen gelöscht werden."
      ]},
      { h: "Externe Dienste", body: [
        ["Die Karte im Kontaktbereich wird als iframe von Google Maps eingebunden. Beim Laden kann Google eigene Cookies setzen und Ihre IP-Adresse erhalten, nach Maßgabe seiner Datenschutzerklärung.",
         "Die Schriften werden von Google Fonts ausgeliefert.",
         "Mit einem Klick auf „Buchen“ verlassen Sie diese Website und gelangen zu unserem Buchungssystem mit eigener Cookie-Richtlinie."]
      ]},
      { h: "Wie Sie sie steuern", body: [
        "Sie können Cookies und Websitedaten in den Einstellungen Ihres Browsers blockieren oder löschen. Die Nutzung dieser Website bleibt davon unberührt; allenfalls merken wir uns Ihre Sprache nicht mehr."
      ]}
    ]
  },

  notice: {
    title: "Impressum",
    intro: "Allgemeine Angaben nach dem spanischen Gesetz 34/2002 über Dienste der Informationsgesellschaft und den elektronischen Geschäftsverkehr (LSSI-CE).",
    sections: [
      { h: "Angaben zum Anbieter", body: [
        `Inhaber: ${COMPANY.legalName} (Handelsname ${COMPANY.tradeName}).`,
        `Steuernummer: ${COMPANY.taxId}. Anschrift: ${COMPANY.address}.`,
        `Kontakt: ${COMPANY.email} · ${COMPANY.phone}.`,
        COMPANY.registry
      ]},
      { h: "Zweck", body: [
        "Diese Website informiert über das Hostal und das Restaurant und erleichtert Anfragen und Buchungen ihrer Leistungen."
      ]},
      { h: "Nutzungsbedingungen", body: [
        "Der Zugang zu dieser Website ist kostenlos. Nutzerinnen und Nutzer verpflichten sich zu einem ordnungsgemäßen Umgang mit den Inhalten und dazu, sie nicht für rechtswidrige oder schädigende Zwecke zu verwenden."
      ]},
      { h: "Urheberrecht", body: [
        "Texte, Fotografien und Gestaltung dieser Website stehen dem Haus zu oder werden mit Genehmigung verwendet. Vervielfältigung oder Verbreitung ohne vorherige Zustimmung sind nicht gestattet."
      ]},
      { h: "Haftung", body: [
        "Wir bemühen uns, die veröffentlichten Angaben aktuell und zutreffend zu halten; Preise, Öffnungszeiten und Verfügbarkeit können sich jedoch ändern. Verbindlich sind die Angaben in Ihrer Buchungsbestätigung.",
        "Für die Inhalte verlinkter Websites Dritter übernehmen wir keine Verantwortung."
      ]},
      { h: "Anwendbares Recht", body: [
        "Es gilt spanisches Recht. Für Streitigkeiten sind die nach den anwendbaren Vorschriften zuständigen Gerichte berufen."
      ]}
    ]
  }
},

/* =============================== CATALÀ ============================== */
ca: {
  _ui: { updated: "Darrera actualització", draft: "Esborrany pendent de revisió legal.", draftBody: "Aquest text s'ha redactat com a punt de partida i encara no ha estat revisat per un advocat. No el considereu definitiu sense aquesta revisió i sense completar les dades identificatives marcades.", home: "Tornar a l'inici" },

  privacy: {
    title: "Política de privacitat",
    intro: "Aquesta política explica quines dades personals tractem quan ens escriviu o reserveu, amb quina finalitat i quins drets hi teniu.",
    sections: [
      { h: "Responsable del tractament", body: [
        `${COMPANY.legalName} (nom comercial ${COMPANY.tradeName}), amb NIF ${COMPANY.taxId} i domicili a ${COMPANY.address}. Correu electrònic: ${COMPANY.email}. Telèfon: ${COMPANY.phone}.`
      ]},
      { h: "Quines dades tractem i per què", body: [
        "Quan ompliu el formulari de contacte tractem el nom, el correu electrònic, el telèfon si el faciliteu i el contingut del missatge, juntament amb les dates i el nombre d'hostes si els heu seleccionat.",
        "La finalitat és únicament atendre la vostra consulta o sol·licitud de reserva i respondre-us. No elaborem perfils ni prenem decisions automatitzades.",
        "La base jurídica és el vostre consentiment i, quan la consulta va adreçada a formalitzar una reserva, l'aplicació de mesures precontractuals a petició vostra."
      ]},
      { h: "Qui rep les vostres dades", body: [
        "Aquest és un lloc estàtic i no té base de dades pròpia: no desem el vostre missatge en aquest servidor.",
        ["El formulari s'envia a través de FormSubmit (formsubmit.co), que transmet el contingut al nostre correu electrònic i actua com a encarregat del tractament.",
         "Les reserves en ferm es gestionen mitjançant el nostre motor de reserves, Amenitiz, amb la seva pròpia política de privacitat.",
         "El correu electrònic s'allotja al proveïdor de correu de l'establiment."],
        "No cedim les vostres dades a tercers amb finalitats comercials ni fem transferències internacionals més enllà de les que impliquin els proveïdors esmentats."
      ]},
      { h: "Quant de temps les conservem", body: [
        "Conservem els missatges el temps necessari per atendre la consulta i, després, durant el termini en què puguin derivar-se responsabilitats legals. Les dades d'una reserva es conserven segons la normativa fiscal i de registre de viatgers aplicable."
      ]},
      { h: "Els vostres drets", body: [
        "Podeu sol·licitar l'accés a les vostres dades, la rectificació o supressió, la limitació o oposició al tractament i la portabilitat, escrivint a " + COMPANY.email + " i indicant la vostra petició.",
        "Si considereu que no hem atès correctament la sol·licitud, podeu reclamar davant l'Agència Espanyola de Protecció de Dades (www.aepd.es)."
      ]}
    ]
  },

  cookies: {
    title: "Política de galetes",
    intro: "Aquest lloc s'ha construït de manera deliberadament senzilla: no utilitza galetes d'anàlisi, de publicitat ni de seguiment.",
    sections: [
      { h: "Què fem servir", body: [
        "No instal·lem galetes publicitàries ni analítiques, i en aquestes pàgines no hi ha eines de seguiment de tercers. Per això no veureu cap bàner de consentiment: no hi ha res a consentir.",
        "Fem servir únicament una dada d'emmagatzematge local del navegador (localStorage), anomenada bv_lang, que desa l'idioma que trieu per no haver-vos-ho de tornar a preguntar. És tècnicament necessària per a aquesta funció, no identifica la persona i la podeu esborrar en qualsevol moment des de la configuració del navegador."
      ]},
      { h: "Serveis externs", body: [
        ["El mapa de la secció de contacte es mostra mitjançant un iframe de Google Maps. En carregar-lo, Google pot instal·lar les seves pròpies galetes i rebre la vostra adreça IP, d'acord amb la seva política de privacitat.",
         "Les tipografies se serveixen des de Google Fonts.",
         "En prémer «Reservar» abandoneu aquest lloc i accediu al nostre motor de reserves, que aplica la seva pròpia política de galetes."]
      ]},
      { h: "Com controlar-les", body: [
        "Podeu bloquejar o eliminar galetes i dades de llocs des de la configuració del navegador. Fer-ho no us impedirà fer servir aquest lloc; com a molt, deixarem de recordar el vostre idioma."
      ]}
    ]
  },

  notice: {
    title: "Avís legal",
    intro: "Informació general exigida per la Llei 34/2002 de serveis de la societat de la informació i de comerç electrònic (LSSI-CE).",
    sections: [
      { h: "Dades identificatives", body: [
        `Titular: ${COMPANY.legalName} (nom comercial ${COMPANY.tradeName}).`,
        `NIF: ${COMPANY.taxId}. Domicili: ${COMPANY.address}.`,
        `Contacte: ${COMPANY.email} · ${COMPANY.phone}.`,
        COMPANY.registry
      ]},
      { h: "Objecte", body: [
        "Aquest lloc web té per finalitat oferir informació sobre l'hostal i el restaurant i facilitar la consulta i la reserva dels seus serveis."
      ]},
      { h: "Condicions d'ús", body: [
        "L'accés a aquest lloc és gratuït. L'usuari es compromet a fer un ús adequat dels continguts i a no emprar-los amb finalitats il·lícites o lesives per a tercers."
      ]},
      { h: "Propietat intel·lectual", body: [
        "Els textos, les fotografies i el disseny d'aquest lloc són titularitat de l'establiment o s'utilitzen amb autorització. No se'n permet la reproducció ni la distribució sense consentiment previ."
      ]},
      { h: "Responsabilitat", body: [
        "Procurem que la informació publicada sigui exacta i estigui actualitzada, però els preus, els horaris i la disponibilitat poden variar. La informació contractual vinculant és la que consti a la confirmació de la vostra reserva.",
        "No ens fem responsables del contingut dels llocs de tercers enllaçats des d'aquestes pàgines."
      ]},
      { h: "Legislació aplicable", body: [
        "Aquesta relació es regeix per la legislació espanyola. Per a qualsevol controvèrsia seran competents els jutjats i tribunals que correspongui conforme a dret."
      ]}
    ]
  }
}

};

module.exports = { LEGAL, COMPANY, DRAFT };
