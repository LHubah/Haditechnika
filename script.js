const cursor = document.getElementById("timelineCursor");
const yearLabel = document.getElementById("currentYear");
const progress = document.getElementById("timelineProgress");
const events = document.querySelectorAll(".timeline-event");

const startYear = 1900;
const endYear = 2000;

function updateTimeline() {
    const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

    const points = [];

    events.forEach(event => {
        const target = document.getElementById(event.dataset.target);

        if (!target) {
            console.warn("Nem található:", event.dataset.target);
            return;
        }

    const position =
        target.getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight * 0.1;

        points.push({
            year: Number(event.dataset.year),
            position,
            element: event
        });
    });

    points.sort((a, b) => a.position - b.position);

    if (points.length < 2) return;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const startPosition = firstPoint.position;
    const endPosition = lastPoint.position;
    const percent = Math.max(0, Math.min(1,
        (window.scrollY - startPosition) /
        (endPosition - startPosition)
    ));

    cursor.style.top = `${percent * 100}%`;
    progress.style.height = `${percent * 100}%`;

    let year = startYear;

    if (window.scrollY >= endPosition) {
        year = endYear;
    } else if (window.scrollY > startPosition) {
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];

            if (window.scrollY >= current.position &&
                window.scrollY <= next.position) {

                const part =
                    (window.scrollY - current.position) /
                    (next.position - current.position);

                year = current.year +
                    part * (next.year - current.year);

                break;
            }
        }
    }

    yearLabel.textContent = Math.round(year);
    points.forEach(point => {
        const pointPercent =
            (point.position - startPosition) /
            (endPosition - startPosition) * 100;

        point.element.style.top = `${pointPercent}%`;
    });
}

window.addEventListener("scroll", updateTimeline, { passive: true });
window.addEventListener("resize", updateTimeline);
window.addEventListener("load", updateTimeline);

updateTimeline();

document.querySelectorAll(".korszak-kartya").forEach(kartya => {
    kartya.onclick = function(e) {
        e.preventDefault();

        document.querySelector(this.getAttribute("href"))
            .scrollIntoView({ behavior: "smooth" });
    };
});
