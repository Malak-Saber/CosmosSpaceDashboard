const NASA_API_KEY = "DEMO_KEY";
const APOD_API_URL = "https://api.nasa.gov/planetary/apod";
const LAUNCHES_API_URL = "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=10&mode=normal";
const PLANETS_API_URL = "https://api.le-systeme-solaire.net/rest/bodies/?filter%5B%5D=isPlanet%2Ceq%2Ctrue";
const SOLAR_API_TOKEN = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const apodDate = $("#apod-date");
const apodDateInput = $("#apod-date-input");
const loadDateBtn = $("#load-date-btn");
const todayApodBtn = $("#today-apod-btn");
const apodLoading = $("#apod-loading");
const apodImage = $("#apod-image");
const apodTitle = $("#apod-title");
const apodDateDetail = $("#apod-date-detail");
const apodExplanation = $("#apod-explanation");
const apodCopyright = $("#apod-copyright");
const apodDateInfo = $("#apod-date-info");
const apodMediaType = $("#apod-media-type");
const featuredLaunch = $("#featured-launch");
const launchesGrid = $("#launches-grid");
const launchesCount = $("#launches-count");
const launchesCountMobile = $("#launches-count-mobile");
const planetsGrid = $("#planets-grid");
const planetComparisonBody = $("#planet-comparison-tbody");

const planetColors = {
  mercury: "#94a3b8",
  venus: "#f59e0b",
  earth: "#3b82f6",
  mars: "#ef4444",
  jupiter: "#fb923c",
  saturn: "#facc15",
  uranus: "#06b6d4",
  neptune: "#2563eb"
};

const planetImages = {
  mercury: "./assets/images/mercury.png",
  venus: "./assets/images/venus.png",
  earth: "./assets/images/earth.png",
  mars: "./assets/images/mars.png",
  jupiter: "./assets/images/jupiter.png",
  saturn: "./assets/images/saturn.png",
  uranus: "./assets/images/uranus.png",
  neptune: "./assets/images/neptune.png"
};

function formatDate(dateString, options = { year: "numeric", month: "long", day: "numeric" }) {
  if (!dateString) return "Date unavailable";
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", options);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function showMessage(container, message) {
  if (!container) return;
  container.innerHTML = `
    <div class="col-span-full rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center text-slate-300">
      ${escapeHTML(message)}
    </div>
  `;
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function loadAPOD(date = getTodayDate()) {
  if (!apodImage || !apodLoading) return;

  apodLoading.classList.remove("hidden");
  apodImage.classList.add("opacity-30");

  if (loadDateBtn) loadDateBtn.disabled = true;
  if (todayApodBtn) todayApodBtn.disabled = true;

  try {
    const url = `${APOD_API_URL}?api_key=${NASA_API_KEY}&date=${encodeURIComponent(date)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `NASA API error (${response.status})`);
    }

    const data = await response.json();

    if (apodDate) {
      apodDate.textContent = `Astronomy Picture of the Day - ${formatDate(data.date)}`;
    }

    if (apodTitle) {
      apodTitle.textContent = data.title || "Astronomy Picture of the Day";
    }

    if (apodDateDetail) {
      apodDateDetail.textContent = formatDate(data.date);
    }

    if (apodExplanation) {
      apodExplanation.textContent = data.explanation || "No explanation is available for this image.";
    }

    if (apodCopyright) {
      apodCopyright.textContent = data.copyright ? data.copyright.trim() : "NASA";

      const copyrightRow = apodCopyright.closest("div.flex");

      if (copyrightRow) {
        copyrightRow.classList.toggle("hidden", !data.copyright);
      }
    }

    if (apodDateInfo) {
      apodDateInfo.textContent = formatDate(data.date);
    }

    if (apodMediaType) {
      apodMediaType.textContent = data.media_type === "video" ? "Video" : "Image";
    }

    if (apodDateInput) {
      apodDateInput.value = data.date || date;
    }

    if (data.media_type === "video") {
      apodImage.classList.add("hidden");

      let video = $("#apod-video");

      if (!video && apodImage.parentElement) {
        video = document.createElement("iframe");
        video.id = "apod-video";
        video.className = "w-full h-full min-h-[300px]";
        video.title = "NASA Astronomy Picture of the Day video";
        video.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        video.allowFullscreen = true;

        apodImage.parentElement.insertBefore(video, apodImage.nextSibling);
      }

      if (video) {
        video.src = data.url || "";
        video.classList.remove("hidden");
      }
    } else {
      const video = $("#apod-video");

      if (video) {
        video.src = "";
        video.classList.add("hidden");
      }

      apodImage.classList.remove("hidden");
      apodImage.src = data.hdurl || data.url || "";
      apodImage.alt = data.title || "NASA Astronomy Picture of the Day";

      apodImage.onerror = () => {
        apodImage.alt = "The astronomy image could not be loaded.";
      };
    }
  } catch (error) {
    console.error("Could not load NASA APOD:", error);

    if (apodTitle) {
      apodTitle.textContent = "Unable to load today's space image";
    }

    if (apodExplanation) {
      apodExplanation.textContent = `${error.message}. Please try again in a moment.`;
    }

    if (apodDate) {
      apodDate.textContent = "Astronomy Picture of the Day";
    }
  } finally {
    apodLoading.classList.add("hidden");
    apodImage.classList.remove("opacity-30");

    if (loadDateBtn) loadDateBtn.disabled = false;
    if (todayApodBtn) todayApodBtn.disabled = false;
  }
}

function setupAPOD() {
  const today = getTodayDate();

  if (apodDateInput) {
    apodDateInput.max = today;

    if (!apodDateInput.value || apodDateInput.value > today) {
      apodDateInput.value = today;
    }
  }

  loadDateBtn?.addEventListener("click", () => {
    const selectedDate = apodDateInput?.value;

    if (!selectedDate) {
      alert("Please choose a date first.");
      return;
    }

    if (selectedDate > getTodayDate()) {
      alert("A future date is not available yet. Please choose today or an earlier date.");
      return;
    }

    loadAPOD(selectedDate);
  });

  todayApodBtn?.addEventListener("click", () => {
    const todayDate = getTodayDate();

    if (apodDateInput) {
      apodDateInput.value = todayDate;
    }

    loadAPOD(todayDate);
  });

  apodDateInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadDateBtn?.click();
    }
  });

  loadAPOD(today);
}

function getLaunchImage(launch) {
  return launch.image || launch.rocket?.configuration?.image_url || launch.rocket?.image_url || "";
}

function getLaunchAgency(launch) {
  return launch.launch_service_provider?.name || launch.launch_service_provider?.abbrev || "Agency not announced";
}

function getLaunchLocation(launch) {
  return launch.pad?.location?.name || launch.pad?.name || "Launch location unavailable";
}

function getLaunchStatus(launch) {
  return launch.status?.name || "Status unavailable";
}

function getLaunchDate(launch) {
  return launch.net || launch.window_start || launch.window_end || "";
}

function renderFeaturedLaunch(launch) {
  if (!featuredLaunch) return;

  const image = getLaunchImage(launch);
  const launchDate = getLaunchDate(launch);
  const name = launch.name || "Upcoming space launch";
  const agency = getLaunchAgency(launch);
  const location = getLaunchLocation(launch);
  const status = getLaunchStatus(launch);
  const detailsURL = launch.url || launch.webcast_live || "";

  featuredLaunch.innerHTML = `
    <article class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>

      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 md:p-8">
        <div class="flex flex-col justify-between gap-5">
          <div>
            <span class="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4">
              NEXT FEATURED LAUNCH
            </span>

            <h3 class="text-2xl md:text-3xl font-space font-bold mb-3">${escapeHTML(name)}</h3>
            <p class="text-slate-300 mb-5">${escapeHTML(agency)}</p>

            <div class="space-y-3 text-sm">
              <p class="text-slate-300">
                <i class="far fa-calendar mr-2 text-blue-400"></i>
                ${escapeHTML(formatDate(launchDate ? launchDate.slice(0, 10) : ""))}
                ${launchDate ? ` · ${escapeHTML(new Date(launchDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }))}` : ""}
              </p>

              <p class="text-slate-300">
                <i class="fas fa-location-dot mr-2 text-purple-400"></i>
                ${escapeHTML(location)}
              </p>

              <p class="text-slate-300">
                <i class="fas fa-circle-info mr-2 text-green-400"></i>
                ${escapeHTML(status)}
              </p>
            </div>
          </div>

          ${detailsURL ? `<a href="${escapeHTML(detailsURL)}" target="_blank" rel="noopener noreferrer" class="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors">Launch details <i class="fas fa-arrow-up-right-from-square text-xs"></i></a>` : ""}
        </div>

        <div class="relative min-h-56 lg:min-h-72 rounded-2xl overflow-hidden bg-slate-900/70 flex items-center justify-center">
          ${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(name)}" class="absolute inset-0 w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'">` : `<i class="fas fa-rocket text-7xl text-slate-600"></i>`}
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
        </div>
      </div>
    </article>
  `;
}
function renderLaunchCard(launch) {
  const image = getLaunchImage(launch);
  const launchDate = getLaunchDate(launch);
  const name = launch.name || "Upcoming space launch";
  const agency = getLaunchAgency(launch);
  const location = getLaunchLocation(launch);
  const status = getLaunchStatus(launch);
  const detailsURL = launch.url || launch.webcast_live || "";

  return `
    <article class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group">
      <div class="relative h-44 bg-slate-900/70 flex items-center justify-center overflow-hidden">
        ${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(name)}" class="w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'">` : `<i class="fas fa-rocket text-5xl text-slate-600"></i>`}

        <span class="absolute top-3 right-3 px-3 py-1 rounded-full bg-blue-500/80 text-white text-xs font-semibold">
          ${escapeHTML(status)}
        </span>
      </div>

      <div class="p-5">
        <h3 class="font-space text-lg font-bold mb-2">${escapeHTML(name)}</h3>
        <p class="text-sm text-slate-400 mb-4">${escapeHTML(agency)}</p>

        <div class="space-y-2 text-sm text-slate-300">
          <p><i class="far fa-calendar mr-2 text-blue-400"></i>${escapeHTML(formatDate(launchDate ? launchDate.slice(0, 10) : ""))}</p>
          <p><i class="fas fa-location-dot mr-2 text-purple-400"></i>${escapeHTML(location)}</p>
        </div>

        ${detailsURL ? `<a href="${escapeHTML(detailsURL)}" target="_blank" rel="noopener noreferrer" class="mt-5 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold">View launch <i class="fas fa-arrow-up-right-from-square text-xs"></i></a>` : ""}
      </div>
    </article>
  `;
}

async function loadLaunches() {
  if (!launchesGrid) return;

  showMessage(launchesGrid, "Loading upcoming launches...");

  if (featuredLaunch) {
    featuredLaunch.innerHTML = `
      <div class="p-8 text-center text-slate-400">
        <i class="fas fa-spinner fa-spin mr-2"></i>
        Loading the next launch...
      </div>
    `;
  }

  try {
    const response = await fetch(LAUNCHES_API_URL);

    if (!response.ok) {
      throw new Error(`Launch API error (${response.status})`);
    }

    const data = await response.json();

    const launches = (data.results || []).filter((launch) => {
      return launch && (launch.name || launch.net);
    });

    if (!launches.length) {
      showMessage(launchesGrid, "No upcoming launches were found right now.");

      if (featuredLaunch) {
        featuredLaunch.innerHTML = "";
      }

      return;
    }

    renderFeaturedLaunch(launches[0]);

    launchesGrid.innerHTML = launches.map(renderLaunchCard).join("");

    const countText = `${data.count ?? launches.length} Launches`;

    if (launchesCount) {
      launchesCount.textContent = countText;
    }

    if (launchesCountMobile) {
      launchesCountMobile.textContent = String(data.count ?? launches.length);
    }
  } catch (error) {
    console.error("Could not load upcoming launches:", error);

    showMessage(launchesGrid, "We couldn't load launches. Please refresh the page and try again.");

    if (featuredLaunch) {
      featuredLaunch.innerHTML = `
        <div class="p-6 rounded-2xl border border-slate-700 bg-slate-800/50 text-center text-slate-300">
          ${escapeHTML(error.message)}
        </div>
      `;
    }
  }
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toLocaleString("en-US", {
    maximumFractionDigits: digits
  });
}

function formatMass(mass) {
  if (!mass || mass.massValue === undefined || mass.massExponent === undefined) {
    return "N/A";
  }

  return `${mass.massValue} × 10${toSuperscript(mass.massExponent)} kg`;
}

function toSuperscript(number) {
  const digits = {
    "-": "⁻",
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹"
  };

  return String(number).split("").map((digit) => digits[digit] || digit).join("");
}

function getPlanetType(planet) {
  if (planet.englishName === "Jupiter" || planet.englishName === "Saturn") {
    return "Gas Giant";
  }

  if (planet.englishName === "Uranus" || planet.englishName === "Neptune") {
    return "Ice Giant";
  }

  return "Terrestrial";
}

function getPlanetDescription(planet) {
  const descriptions = {
    Mercury: "Mercury is the smallest planet in our Solar System and the closest planet to the Sun.",
    Venus: "Venus is the second planet from the Sun and has an extremely hot, dense atmosphere.",
    Earth: "Earth is the third planet from the Sun and the only known world to support life.",
    Mars: "Mars is the fourth planet from the Sun, known as the Red Planet because of its reddish surface.",
    Jupiter: "Jupiter is the largest planet in the Solar System and is famous for its Great Red Spot.",
    Saturn: "Saturn is a gas giant known for its spectacular system of rings.",
    Uranus: "Uranus is an ice giant that rotates on its side and has a blue-green appearance.",
    Neptune: "Neptune is a distant ice giant with powerful winds and a deep blue atmosphere."
  };

  return descriptions[planet.englishName] || `${planet.englishName} is a planet in our Solar System.`;
}

function renderPlanetCard(planet) {
  const id = (planet.id || planet.englishName || "").toLowerCase();
  const name = planet.englishName || planet.name || "Unknown planet";
  const color = planetColors[id] || "#818cf8";
  const image = planetImages[id] || "";
  const distance = planet.semimajorAxis
    ? `${formatNumber(planet.semimajorAxis / 149597870.7, 2)} AU`
    : "Distance unavailable";

  const moons = Array.isArray(planet.moons) ? planet.moons.length : 0;

  return `
    <button type="button" class="planet-card text-left bg-slate-800/50 border border-slate-700 rounded-2xl p-3 md:p-4 transition-all cursor-pointer group hover:-translate-y-1 hover:border-blue-400/50" data-planet-id="${escapeHTML(id)}" style="--planet-color:${color}">
      <div class="relative mb-3 h-20 md:h-24 flex items-center justify-center">
        ${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(name)}" class="max-w-full max-h-full object-contain" loading="lazy" onerror="this.style.display='none'">` : `<div class="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg" style="background:radial-gradient(circle at 30% 30%, #ffffff80, ${color} 42%, #0f172a 100%)"></div>`}
      </div>

      <h3 class="font-space font-bold text-sm md:text-base text-center">${escapeHTML(name)}</h3>
      <p class="text-xs text-slate-400 text-center mt-1">${escapeHTML(distance)}</p>
      <p class="text-xs text-slate-500 text-center mt-1">${moons} moon${moons === 1 ? "" : "s"}</p>
    </button>
  `;
}
function renderPlanetComparison(planetList) {
  if (!planetComparisonBody) return;

  planetComparisonBody.innerHTML = planetList.map((planet) => {
    const id = (planet.id || "").toLowerCase();
    const color = planetColors[id] || "#818cf8";
    const name = planet.englishName || planet.name || "Unknown";

    const distance = planet.semimajorAxis
      ? formatNumber(planet.semimajorAxis / 149597870.7, 2)
      : "N/A";

    const diameter = planet.meanRadius
      ? formatNumber(planet.meanRadius * 2, 0)
      : "N/A";

    const gravity = planet.gravity !== undefined
      ? formatNumber(planet.gravity, 2)
      : "N/A";

    const orbitalPeriod = planet.sideralOrbit
      ? `${formatNumber(planet.sideralOrbit, 1)} days`
      : "N/A";

    const moonCount = Array.isArray(planet.moons) ? planet.moons.length : 0;
    const type = getPlanetType(planet);

    return `
      <tr class="hover:bg-slate-800/30 transition-colors">
        <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
          <div class="flex items-center space-x-2 md:space-x-3">
            <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color:${color}"></div>
            <span class="font-semibold text-sm md:text-base whitespace-nowrap">${escapeHTML(name)}</span>
          </div>
        </td>

        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${escapeHTML(distance)}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${escapeHTML(diameter)}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${escapeHTML(gravity)}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${escapeHTML(orbitalPeriod)}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${moonCount}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
          <span class="px-2 py-1 rounded text-xs bg-blue-500/30 text-blue-200">${escapeHTML(type)}</span>
        </td>
      </tr>
    `;
  }).join("");
}

function updatePlanetDetails(planet) {
  const name = planet.englishName || planet.name || "Unknown planet";
  const id = (planet.id || name).toLowerCase();
  const image = planetImages[id] || "";

  const setText = (selector, value) => {
    const element = $(selector);
    if (element) element.textContent = value;
  };

  const detailImage = $("#planet-detail-image");

  if (detailImage && image) {
    detailImage.src = image;
    detailImage.alt = `${name} planet`;
  }

  setText("#planet-detail-name", name);
  setText("#planet-detail-description", getPlanetDescription(planet));

  setText(
    "#planet-distance",
    planet.semimajorAxis
      ? `${formatNumber(planet.semimajorAxis / 149597870.7, 3)} AU`
      : "N/A"
  );

  setText(
    "#planet-radius",
    planet.meanRadius
      ? `${formatNumber(planet.meanRadius, 0)} km`
      : "N/A"
  );

  setText("#planet-mass", formatMass(planet.mass));

  setText(
    "#planet-density",
    planet.density !== undefined
      ? `${formatNumber(planet.density, 2)} g/cm³`
      : "N/A"
  );

  setText(
    "#planet-orbital-period",
    planet.sideralOrbit
      ? `${formatNumber(planet.sideralOrbit, 2)} days`
      : "N/A"
  );

  setText(
    "#planet-rotation",
    planet.sideralRotation
      ? `${formatNumber(planet.sideralRotation, 2)} hours`
      : "N/A"
  );

  setText("#planet-moons", String(Array.isArray(planet.moons) ? planet.moons.length : 0));

  setText(
    "#planet-gravity",
    planet.gravity !== undefined
      ? `${formatNumber(planet.gravity, 2)} m/s²`
      : "N/A"
  );

  setText("#planet-discoverer", planet.discoveredBy || "Known since antiquity");
  setText("#planet-discovery-date", planet.discoveryDate || "Ancient");
  setText("#planet-body-type", getPlanetType(planet));

  setText(
    "#planet-volume",
    planet.vol
      ? `${formatNumber(planet.vol.volValue, 2)} × 10${toSuperscript(planet.vol.volExponent)} km³`
      : "N/A"
  );

  setText(
    "#planet-perihelion",
    planet.perihelion
      ? `${formatNumber(planet.perihelion / 149597870.7, 3)} AU`
      : "N/A"
  );

  setText(
    "#planet-aphelion",
    planet.aphelion
      ? `${formatNumber(planet.aphelion / 149597870.7, 3)} AU`
      : "N/A"
  );

  setText(
    "#planet-eccentricity",
    planet.eccentricity !== undefined
      ? formatNumber(planet.eccentricity, 5)
      : "N/A"
  );

  setText(
    "#planet-inclination",
    planet.inclination !== undefined
      ? `${formatNumber(planet.inclination, 2)}°`
      : "N/A"
  );

  setText(
    "#planet-axial-tilt",
    planet.axialTilt !== undefined
      ? `${formatNumber(planet.axialTilt, 2)}°`
      : "N/A"
  );

  setText(
    "#planet-temp",
    planet.avgTemp !== undefined
      ? `${formatNumber(planet.avgTemp - 273.15, 1)} °C`
      : "N/A"
  );

  setText(
    "#planet-escape",
    planet.escape !== undefined
      ? `${formatNumber(planet.escape, 2)} m/s`
      : "N/A"
  );

  setText("#planet-facts", getPlanetDescription(planet));
}

async function loadPlanets() {
  if (!planetsGrid) return;

  showMessage(planetsGrid, "Loading planets...");

  try {
    const requestOptions = SOLAR_API_TOKEN
      ? { headers: { Authorization: `Bearer ${SOLAR_API_TOKEN}` } }
      : {};

    const response = await fetch(PLANETS_API_URL, requestOptions);

    if (!response.ok) {
      throw new Error(`Solar System API error (${response.status}). The API may require an authorization token.`);
    }

    const data = await response.json();

    const planets = (data.bodies || [])
      .filter((body) => body.isPlanet)
      .sort((a, b) => (a.semimajorAxis || 0) - (b.semimajorAxis || 0));

    if (!planets.length) {
      showMessage(planetsGrid, "No planet data was returned by the API.");
      return;
    }

    planetsGrid.innerHTML = planets.map(renderPlanetCard).join("");

    renderPlanetComparison(planets);

    updatePlanetDetails(
      planets.find((planet) => planet.englishName === "Earth") || planets[0]
    );

    planetsGrid.querySelectorAll("[data-planet-id]").forEach((card) => {
      card.addEventListener("click", () => {
        const selectedPlanet = planets.find((planet) => {
          return (planet.id || planet.englishName).toLowerCase() === card.dataset.planetId;
        });

        if (selectedPlanet) {
          updatePlanetDetails(selectedPlanet);
        }
      });
    });
  } catch (error) {
    console.error("Could not load planets:", error);

    showMessage(
      planetsGrid,
      "We couldn't load planet data. The Solar System OpenData API may require a free API token; check the assignment documentation."
    );
  }
}

function setupNavigation() {
  const navLinks = $$(".nav-link");
  const sections = $$(".app-section");
  const sidebar = $("#sidebar");
  const sidebarToggle = $("#sidebar-toggle");

  function showSection(sectionId) {
    let targetFound = false;

    sections.forEach((section) => {
      const isActive = section.id === sectionId;
      section.classList.toggle("hidden", !isActive);

      if (isActive) {
        targetFound = true;
      }
    });

    if (!targetFound && sections.length) {
      sections.forEach((section, index) => {
        section.classList.toggle("hidden", index !== 0);
      });

      sectionId = sections[0].id;
    }

    navLinks.forEach((link) => {
      const isActive = link.dataset.section === sectionId;

      link.classList.toggle("bg-blue-500/10", isActive);
      link.classList.toggle("text-blue-400", isActive);
      link.classList.toggle("text-slate-300", !isActive);
    });

    if (sidebar && window.innerWidth < 1024) {
      sidebar.classList.add("-translate-x-full");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showSection(link.dataset.section);
    });
  });

  sidebarToggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("-translate-x-full");
  });

  const initialSection = window.location.hash.replace("#", "") || "today-in-space";

  showSection(initialSection);
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupAPOD();
  loadLaunches();
  loadPlanets();
});