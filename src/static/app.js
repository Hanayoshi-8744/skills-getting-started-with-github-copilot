document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // リストとセレクトを初期化（重複防止）
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        // title
        const titleEl = document.createElement("h4");
        titleEl.textContent = name;
        activityCard.appendChild(titleEl);

        // description
        const descEl = document.createElement("p");
        descEl.textContent = details.description;
        activityCard.appendChild(descEl);

        // schedule
        const scheduleEl = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule:";
        scheduleEl.appendChild(scheduleStrong);
        scheduleEl.appendChild(document.createTextNode(" " + details.schedule));
        activityCard.appendChild(scheduleEl);

        // availability
        const spotsLeft = details.max_participants - details.participants.length;
        const availEl = document.createElement("p");
        const availStrong = document.createElement("strong");
        availStrong.textContent = "Availability:";
        availEl.appendChild(availStrong);
        availEl.appendChild(document.createTextNode(" " + spotsLeft + " spots left"));
        activityCard.appendChild(availEl);

        // participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeader = document.createElement("h5");
        participantsHeader.textContent = "Participants";
        participantsSection.appendChild(participantsHeader);

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          // optional small count
          const countSpan = document.createElement("span");
          countSpan.className = "participant-count";
          countSpan.textContent = `(${details.participants.length})`;
          participantsHeader.appendChild(countSpan);

          const ul = document.createElement("ul");
          ul.className = "participants-list";

          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            // participant email label
            const span = document.createElement("span");
            span.className = "participant-email";
            span.textContent = p;
            li.appendChild(span);

            // delete button
            const delBtn = document.createElement("button");
            delBtn.className = "delete-btn";
            delBtn.setAttribute("aria-label", `Unregister ${p} from ${name}`);
            delBtn.title = "Unregister";
            delBtn.innerHTML = "✖"; // simple cross icon

            // Click handler to unregister participant
            delBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              // Confirm (native, small safeguard)
              if (!confirm(`Unregister ${p} from ${name}?`)) return;

              try {
                const res = await fetch(
                  `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(p)}`,
                  { method: "DELETE" }
                );

                const json = await res.json();
                if (res.ok) {
                  // Refresh activities to keep UI in sync
                  fetchActivities();
                } else {
                  messageDiv.textContent = json.detail || json.message || "Failed to unregister";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                }
              } catch (err) {
                console.error("Error unregistering:", err);
                messageDiv.textContent = "Failed to unregister. Please try again.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
              }
            });

            li.appendChild(delBtn);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        } else {
          const noneP = document.createElement("p");
          noneP.className = "info";
          noneP.textContent = "No participants yet.";
          participantsSection.appendChild(noneP);
        }

        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
