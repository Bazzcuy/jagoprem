(() => {
  const saved = JSON.parse(sessionStorage.getItem("jagoprem_payment") || "null");
  const order = saved?.order;
  const button = document.querySelector("#confirm");
  const notice = document.querySelector("#notice");
  if (!order || !button || !notice) return;

  const deadline = new Date(order.expiresAt || Date.now() + 30 * 60 * 1000);
  const countdown = document.createElement("span");
  countdown.className = "deadline-countdown";
  document.querySelector(".deadline")?.appendChild(countdown);
  const updateCountdown = () => {
    const remaining = Math.max(0, deadline.getTime() - Date.now());
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    countdown.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const setWaiting = (
    message = "Konfirmasi diterima. Tim admin sedang memverifikasi pembayaran kamu.",
  ) => {
    button.disabled = true;
    button.className = "confirm waiting";
    button.textContent = "Menunggu verifikasi admin";
    notice.textContent = message;
    notice.className = "notice show";
  };
  const setSuccess = () => {
    button.disabled = true;
    button.className = "confirm success";
    button.textContent = "Pembayaran berhasil";
    notice.textContent =
      "Pembayaran sudah diverifikasi. Pesanan sedang diproses.";
    notice.className = "notice show";
  };

  if (["paid", "completed"].includes(order.status)) setSuccess();
  else if (order.paymentClaimedAt) setWaiting();

  button.onclick = async () => {
    button.disabled = true;
    button.className = "confirm";
    button.textContent = "Memeriksa pembayaran...";
    notice.className = "notice";
    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(order.id)}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-JagoPrem-Request": "1",
          },
          body: "{}",
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error();
      order.paymentClaimedAt = new Date().toISOString();
      sessionStorage.setItem("jagoprem_payment", JSON.stringify(saved));
      setTimeout(() => setWaiting(data.message), 600);
    } catch {
      notice.textContent =
        "Konfirmasi belum dapat diproses. Silakan coba kembali.";
      notice.className = "notice show error";
      button.disabled = false;
      button.textContent = "Coba konfirmasi lagi";
    }
  };

  const refreshStatus = async () => {
    try {
      const response = await fetch("/api/orders/me", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const latest = (data.orders || []).find((item) => item.id === order.id);
      if (!latest) return;
      saved.order = latest;
      sessionStorage.setItem("jagoprem_payment", JSON.stringify(saved));
      if (["paid", "completed"].includes(latest.status)) setSuccess();
      else if (latest.paymentClaimedAt) setWaiting();
    } catch {}
  };
  setInterval(refreshStatus, 6000);
})();
