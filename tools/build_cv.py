"""Build the public, ATS-readable placement CV used by the portfolio site."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "jamie_parr_public_cv.pdf"

NAVY = colors.HexColor("#173A5E")
BLUE = colors.HexColor("#1D5A7A")
INK = colors.HexColor("#20262E")
MUTED = colors.HexColor("#53606D")
RULE = colors.HexColor("#AFC1D1")


def link(label: str, url: str) -> str:
    return f'<a href="{url}" color="{BLUE.hexval()}"><u>{label}</u></a>'


def section(title: str, heading_style: ParagraphStyle) -> list:
    return [
        Spacer(1, 4.5),
        Paragraph(title, heading_style),
        HRFlowable(width="100%", thickness=0.55, color=RULE, spaceBefore=1, spaceAfter=3),
    ]


def bullet(text: str, bullet_style: ParagraphStyle) -> Paragraph:
    return Paragraph(text, bullet_style, bulletText="-")


def footer(canvas, doc) -> None:
    canvas.saveState()
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.45)
    canvas.line(doc.leftMargin, 13.5 * mm, A4[0] - doc.rightMargin, 13.5 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.7)
    text = "Available for a 2027/28 industrial placement | Full UK driving licence"
    canvas.drawString((A4[0] - stringWidth(text, "Helvetica", 7.7)) / 2, 9.7 * mm, text)
    canvas.restoreState()


def build() -> Path:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=13.5 * mm,
        bottomMargin=18 * mm,
        title="Jamie Parr - Software, Web and IT Placement CV",
        author="Jamie Parr",
        subject="Public CV for 2027/28 industrial placement applications",
        creator="Jamie Parr portfolio CV builder",
    )

    base = getSampleStyleSheet()
    name_style = ParagraphStyle(
        "Name",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=23,
        leading=24,
        alignment=TA_CENTER,
        textColor=NAVY,
        spaceAfter=1,
    )
    title_style = ParagraphStyle(
        "Title",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11.2,
        leading=13,
        alignment=TA_CENTER,
        textColor=INK,
        spaceAfter=2,
    )
    contact_style = ParagraphStyle(
        "Contact",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=8.6,
        leading=10.4,
        alignment=TA_CENTER,
        textColor=MUTED,
        spaceAfter=4,
    )
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11.2,
        leading=12.8,
        textColor=NAVY,
        spaceBefore=0,
        spaceAfter=0,
        keepWithNext=True,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=9.7,
        leading=11.55,
        textColor=INK,
        spaceAfter=1.5,
    )
    project_style = ParagraphStyle(
        "Project",
        parent=body_style,
        fontName="Helvetica-Bold",
        fontSize=9.8,
        leading=11.45,
        textColor=NAVY,
        spaceBefore=2.2,
        spaceAfter=0.7,
        keepWithNext=True,
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        parent=body_style,
        fontSize=9.35,
        leading=11.05,
        leftIndent=10,
        firstLineIndent=0,
        bulletIndent=1,
        spaceAfter=0.5,
    )
    compact_style = ParagraphStyle(
        "Compact",
        parent=body_style,
        fontSize=9.35,
        leading=11.05,
        spaceAfter=1.1,
    )

    story = [
        Paragraph("JAMIE PARR", name_style),
        Paragraph("Computing Technologies Student | 2027/28 Software, Web and IT Placement", title_style),
        Paragraph(
            "Belfast, Northern Ireland&nbsp;&nbsp; | &nbsp;&nbsp;"
            + link("jamieparr205@gmail.com", "mailto:jamieparr205@gmail.com")
            + "&nbsp;&nbsp; | &nbsp;&nbsp;"
            + link("Portfolio", "https://jamie-parr-portfolio.netlify.app/")
            + "&nbsp;&nbsp; | &nbsp;&nbsp;"
            + link("GitHub", "https://github.com/JamieP-205")
            + "&nbsp;&nbsp; | &nbsp;&nbsp;"
            + link("LinkedIn", "https://www.linkedin.com/in/jamie-parr-577783292"),
            contact_style,
        ),
        HRFlowable(width="100%", thickness=1.15, color=NAVY, spaceBefore=0, spaceAfter=1),
    ]

    story += section("PROFILE", heading_style)
    story.append(
        Paragraph(
            "Computing Technologies student at Ulster University, entering Year 2 in September 2026 and seeking a "
            "2027/28 industrial placement in software engineering, web development or technical support. Built and "
            "deployed tested web systems for a live stakeholder using TypeScript/JavaScript, serverless functions and "
            "CI/CD. Brings nearly five years of continuous part-time work, customer service, accuracy and dependable teamwork.",
            body_style,
        )
    )

    story += section("SELECTED TECHNICAL PROJECTS", heading_style)
    story.append(
        KeepTogether(
            [
                Paragraph(
                    f'{link("Coast Internet Radio", "https://coastinternetradio.com/")} - Website Developer | '
                    f'{link("Source", "https://github.com/JamieP-205/coast-internet-radio")} | 2026 - Present',
                    project_style,
                ),
                bullet(
                    "Rebuilt and now maintain a live station website, working with the owner and using operational feedback to improve the mobile listener experience and owner-managed content.",
                    bullet_style,
                ),
                bullet(
                    "Solved an HTTPS/HTTP browser block with Cloudflare Worker relays; added signed admin sessions, first-party analytics, automated checks and deployment safeguards.",
                    bullet_style,
                ),
            ]
        )
    )
    story.append(
        KeepTogether(
            [
                Paragraph(
                    f'{link("French for Life", "https://french-learning-platform-one.vercel.app/")} - Developer | '
                    f'{link("Source", "https://github.com/JamieP-205/french-learning-platform")} | Next.js, TypeScript, Supabase | 2026',
                    project_style,
                ),
                bullet(
                    "Built an A1 learning platform with prerequisite modelling and teach-before-test rules so learners are not assessed on language the app has not taught.",
                    bullet_style,
                ),
                bullet(
                    "Implemented deterministic answer checking, mistake-driven review and release gates covering unit, curriculum and Playwright browser tests.",
                    bullet_style,
                ),
            ]
        )
    )
    story.append(
        KeepTogether(
            [
                Paragraph(
                    f'{link("The World Forgot Us", "https://jamiep-205.github.io/the-world-forgot-us/")} - Developer | '
                    f'{link("Source", "https://github.com/JamieP-205/the-world-forgot-us")} | Godot 4, GDScript | 2026',
                    project_style,
                ),
                bullet(
                    "Built and published a four-area road-story game with persistent state, combat, upgrades, environmental puzzles and multiple endings.",
                    bullet_style,
                ),
                bullet(
                    "Created a GitHub Actions pipeline that imports the project, runs a complete campaign smoke test, exports the Web build and deploys the playable release.",
                    bullet_style,
                ),
            ]
        )
    )

    story += section("TECHNICAL SKILLS", heading_style)
    story.extend(
        [
            Paragraph(
                "<b>Languages:</b> TypeScript, JavaScript, HTML, CSS, SQL, Python, GDScript. "
                "<b>Frameworks/platforms:</b> React, Next.js, Node.js, Supabase, Netlify, Vercel, Cloudflare Workers, Godot 4.",
                compact_style,
            ),
            Paragraph(
                "<b>Engineering:</b> Git/GitHub, GitHub Actions, CI/CD, Playwright, Vitest, APIs, serverless functions, "
                "responsive design, accessibility, debugging, troubleshooting and technical documentation.",
                compact_style,
            ),
        ]
    )

    story += section("EDUCATION AND CERTIFICATION", heading_style)
    story.extend(
        [
            Paragraph(
                "<b>BSc (Hons) Computing Technologies - Ulster University, Belfast</b> | 2025 - 2029 expected<br/>"
                "Entering Year 2 in September 2026. Study includes programming, computing systems, databases, web technologies and technical problem-solving.",
                compact_style,
            ),
            Paragraph(
                "<b>Level 3 Extended Diploma in Technology - Southern Regional College</b> | 2022 - 2024 | D*DD<br/>"
                "<b>Certification:</b> Information Technology Specialist in HTML and CSS - Certiport / Pearson VUE, 2023.",
                compact_style,
            ),
        ]
    )

    story += section("WORK EXPERIENCE", heading_style)
    story.extend(
        [
            Paragraph(
                "<b>Warehouse Operative - Pet Connection, Newry</b> | Oct 2021 - Present<br/>"
                "Prepare customer and fulfilment orders accurately, organise stock and follow safety and dispatch procedures while balancing long-term employment with study.",
                compact_style,
            ),
            Paragraph(
                "<b>Kitchen Porter - The Garden Room, Warrenpoint</b> | Aug 2024 - Present<br/>"
                "Support kitchen and front-of-house teams during busy services, maintain hygiene standards and assist with stock rotation and changing priorities.",
                compact_style,
            ),
            Paragraph(
                "<b>Floor Staff - No.7 Duke, Warrenpoint</b> | Jun 2022 - Sep 2022 - Supported customers, event preparation and stock replenishment in a public-facing environment.",
                compact_style,
            ),
        ]
    )

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return OUTPUT


if __name__ == "__main__":
    print(build())
