const cursor = document.getElementById("timelineCursor");
const yearLabel = document.getElementById("currentYear");
const progress = document.getElementById("timelineProgress");
const events = document.querySelectorAll(".timeline-event");

const startYear = 1900;
const endYear = 2000;

function updateTimeline() {
    const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

    const percent = maxScroll > 0
        ? Math.max(0, Math.min(1, window.scrollY / maxScroll))
        : 0;

    const year = Math.round(
        startYear + percent * (endYear - startYear)
    );

    cursor.style.top = `${percent * 100}%`;
    progress.style.height = `${percent * 100}%`;
    yearLabel.textContent = year;
}

events.forEach(event => {
    const year = Number(event.dataset.year);
    const percent = (year - startYear) / (endYear - startYear);

    event.style.top = `${percent * 100}%`;
});

window.addEventListener("scroll", updateTimeline, { passive: true });
window.addEventListener("resize", updateTimeline);

updateTimeline();

document.querySelectorAll('.korszak-kartya').forEach(kartya => {
    kartya.onclick = function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href'))
            .scrollIntoView({ behavior: 'smooth' });
    };
});