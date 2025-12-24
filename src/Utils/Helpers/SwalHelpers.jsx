import Swal from "sweetalert2";

const SHOW_DELAY = 180; // only show loading if op slower than this
const MIN_VISIBLE = 1000; // if loading shown, keep it visible at least this long

export const confirmLogout = (onConfirm) => {
  Swal.fire({
    title: "Yakin ingin logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, logout",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      (async () => {
        // show loading modal while the async action runs
        let loadingShown = false;
        let loadingStart = 0;
        const showTimer = setTimeout(() => {
          loadingShown = true;
          loadingStart = Date.now();
          Swal.fire({
            title: "Mohon tunggu...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
          });
        }, SHOW_DELAY);

        try {
          await onConfirm();
          clearTimeout(showTimer);
          if (!loadingShown) {
            // fast op -> show success immediately
            Swal.fire({
              title: "Sukses",
              icon: "success",
              timer: 1000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          } else {
            // loading shown -> ensure min visible time
            const elapsed = Date.now() - loadingStart;
            const wait = Math.max(0, MIN_VISIBLE - elapsed);
            setTimeout(() => {
              Swal.fire({
                title: "Sukses",
                icon: "success",
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
              });
            }, wait);
          }
        } catch (err) {
          clearTimeout(showTimer);
          if (loadingShown) {
            const elapsed = Date.now() - loadingStart;
            const wait = Math.max(0, MIN_VISIBLE - elapsed);
            setTimeout(() => {
              Swal.fire({
                title: "Gagal",
                text: "Terjadi kesalahan",
                icon: "error",
                showConfirmButton: true,
              });
            }, wait);
          } else {
            Swal.fire({
              title: "Gagal",
              text: "Terjadi kesalahan",
              icon: "error",
              showConfirmButton: true,
            });
          }
        }
      })();
    }
  });
};

export const confirmDelete = (onConfirm) => {
  Swal.fire({
    title: "Yakin ingin menghapus data ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      (async () => {
        let loadingShown = false;
        let loadingStart = 0;
        const showTimer = setTimeout(() => {
          loadingShown = true;
          loadingStart = Date.now();
          Swal.fire({
            title: "Menghapus...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
          });
        }, SHOW_DELAY);

        try {
          await onConfirm();
          clearTimeout(showTimer);
          if (!loadingShown) {
            Swal.fire({
              title: "Sukses",
              icon: "success",
              timer: 1000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          } else {
            const elapsed = Date.now() - loadingStart;
            const wait = Math.max(0, MIN_VISIBLE - elapsed);
            setTimeout(() => {
              Swal.fire({
                title: "Sukses",
                icon: "success",
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
              });
            }, wait);
          }
        } catch (err) {
          clearTimeout(showTimer);
          if (loadingShown) {
            const elapsed = Date.now() - loadingStart;
            const wait = Math.max(0, MIN_VISIBLE - elapsed);
            setTimeout(() => {
              Swal.fire({
                title: "Gagal",
                text: "Terjadi kesalahan saat menghapus data.",
                icon: "error",
                showConfirmButton: true,
              });
            }, wait);
          } else {
            Swal.fire({
              title: "Gagal",
              text: "Terjadi kesalahan saat menghapus data.",
              icon: "error",
              showConfirmButton: true,
            });
          }
        }
      })();
    }
  });
};

export const confirmUpdate = (onConfirm) => {
  Swal.fire({
    title: "Yakin ingin memperbarui data ini?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, perbarui",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      (async () => {
        let loadingShown = false;
        let loadingStart = 0;
        const showTimer = setTimeout(() => {
          loadingShown = true;
          loadingStart = Date.now();
          Swal.fire({
            title: "Memperbarui...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
          });
        }, SHOW_DELAY);

        try {
          await onConfirm();
          clearTimeout(showTimer);
          if (!loadingShown) {
            Swal.fire({
              title: "Sukses",
              icon: "success",
              timer: 1000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          } else {
            const elapsed = Date.now() - loadingStart;
            const wait = Math.max(0, MIN_VISIBLE - elapsed);
            setTimeout(() => {
              Swal.fire({
                title: "Sukses",
                icon: "success",
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
              });
            }, wait);
          }
        } catch (err) {
          clearTimeout(showTimer);
          if (loadingShown) {
            const elapsed = Date.now() - loadingStart;
            const wait = Math.max(0, MIN_VISIBLE - elapsed);
            setTimeout(() => {
              Swal.fire({
                title: "Gagal",
                text: "Terjadi kesalahan saat memperbarui data.",
                icon: "error",
                showConfirmButton: true,
              });
            }, wait);
          } else {
            Swal.fire({
              title: "Gagal",
              text: "Terjadi kesalahan saat memperbarui data.",
              icon: "error",
              showConfirmButton: true,
            });
          }
        }
      })();
    }
  });
};