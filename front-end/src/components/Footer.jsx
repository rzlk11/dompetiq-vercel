import { Container, Grid, Box, Typography, IconButton } from "@mui/material";
import { Facebook, Instagram, Twitter, YouTube, Phone } from "@mui/icons-material";
import footerlogo from "../assets/footer-logo.png";
import footerIDXOJK from "../assets/footer-IDKOJK.png"; // Gambar gabungan OJK dan IDX

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#40AC0B",
        color: "white",
        padding: "20px 0",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          {/* Logo Utama */}
          <Grid item xs={12} md={6}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems={{ xs: "center", md: "flex-start" }}
              textAlign={{ xs: "center", md: "left" }}
              sx={{ mb: { xs: 3, md: 0 } }}
            >
              <img
                src={footerlogo}
                alt="DompetIQ Logo"
                style={{ height: 60, marginBottom: 7 }}
              />
              <Typography variant="body2" sx={{ fontSize: "14px" }}>
                Smart solutions for personal finance <br />
                Aplikasi Pengelola Keuangan Pribadi dan Rumah Tangga
              </Typography>
            </Box>
          </Grid>

          {/* Navigasi */}
          <Grid item xs={6} md={2}>
            <Box textAlign={{ xs: "center", md: "left" }}>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold", marginBottom: 2 }}
              >
                Jelajahi
              </Typography>
              <Typography>
                <a href="#Home" style={{ color: "white", textDecoration: "none" }}>Home</a>
              </Typography>
              <Typography>
                <a href="#Tentang" style={{ color: "white", textDecoration: "none" }}>Tentang</a>
              </Typography>
              <Typography>
                <a href="#Fitur" style={{ color: "white", textDecoration: "none" }}>Fitur</a>
              </Typography>
              <Typography>
                <a href="#Tangkapan-Layar" style={{ color: "white", textDecoration: "none" }}>Tangkapan Layar</a>
              </Typography>
            </Box>
          </Grid>

          {/* Informasi & Kebijakan */}
          <Grid item xs={6} md={2}>
            <Box textAlign={{ xs: "center", md: "left" }}>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold", marginBottom: 2 }}
              >
                Informasi
              </Typography>
              <Typography>
                <a href="https://api.whatsapp.com/send/?phone=6285804470316&text&type=phone_number&app_absent=0" style={{ color: "white", textDecoration: "none" }}>Hubungi Kami</a>
              </Typography>
              <Typography>
                <a href="#Komunitas" style={{ color: "white", textDecoration: "none" }}>Komunitas</a>
              </Typography>
              <Typography>
                <a href="https://www.iubenda.com/privacy-policy/7794316" style={{ color: "white", textDecoration: "none" }}>Kebijakan Privasi</a>
              </Typography>
              <Typography>
                <a href="#Terms" style={{ color: "white", textDecoration: "none" }}>Terms of Service</a>
              </Typography>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} md={2}>
            <Box textAlign={{ xs: "center", md: "left" }}>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: "bold", marginBottom: 2 }}
              >
                Support
              </Typography>
              <Typography>
                <a href="#PanduanPengguna" style={{ color: "white", textDecoration: "none" }}>Panduan Pengguna</a>
              </Typography>
              <Typography>
                <a href="#Komunitas" style={{ color: "white", textDecoration: "none" }}>Pengumuman</a>
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Logo Gabungan OJK & IDX dan Sosial Media */}
        <Box mt={5}>
          {/* Garis Pemisah */}
          <Box
            sx={{
              borderBottom: "1px solid white",
              mb: 2,
              width: "100%",
            }}
          />
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems="center"
            textAlign="center"
          >
            {/* Ikon Sosial Media */}
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              sx={{ marginBottom: { xs: 2, md: 0 } }}
            >
              <Typography variant="subtitle1" sx={{ color: "white" }}>
                Follow us on:
              </Typography>
              <IconButton color="inherit">
                <Instagram />
              </IconButton>
              <IconButton color="inherit">
                <Facebook />
              </IconButton>
              <IconButton color="inherit">
                <Twitter />
              </IconButton>
              <IconButton color="inherit">
                <YouTube />
              </IconButton>
              <IconButton color="inherit">
                <Phone />
              </IconButton>
            </Box>

            {/* Gambar Gabungan OJK & IDX */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ color: "white", marginBottom: 1 }}
              >
                Sertifikasi dan Akreditasi:
              </Typography>
              <img src={footerIDXOJK} alt="OJK dan IDX Logo" style={{ height: 70 }} />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;