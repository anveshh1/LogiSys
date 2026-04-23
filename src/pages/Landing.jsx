import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d0d",
      color: "#f0f0f0",
      fontFamily: "var(--sans)",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Dot Grid Background */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(circle, #1e1e1e 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        opacity: 0.5
      }} />

      {/* NAVBAR */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        borderBottom: "1px solid #1a1a1a",
        position: "relative",
        zIndex: 2
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            border: "1.5px solid #ff3c3c",
            borderRadius: "8px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontFamily: "var(--mono)",
            fontWeight: "500",
            color: "#ff3c3c"
          }}>
            LS
          </div>
          <span style={{ letterSpacing: "0.1em", fontWeight: "700", fontSize: "15px" }}>
            LOGISYS
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {user ? (
            <Link to="/app/dashboard">
              <button className="btn btn-cream">DASHBOARD →</button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <button className="btn btn-outline">LOG IN →</button>
              </Link>
              <Link to="/signup">
                <button className="btn btn-cream">GET STARTED →</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="fade-up" style={{
        padding: "100px 40px",
        maxWidth: "900px",
        position: "relative",
        zIndex: 2
      }}>

        {/* Badge */}
        <div className="badge badge-accent" style={{ marginBottom: "32px" }}>
          ● PRIORITY-BASED ORDER DISTRIBUTION
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(40px, 6vw, 64px)",
          lineHeight: "1.05",
          fontWeight: "800",
          marginBottom: "22px",
          letterSpacing: "-0.02em",
        }}>
          Fair queues.<br />
          Zero chaos.<br />
          <span style={{ color: "#ff3c3c" }}>
            First come,<br />first served.
          </span>
        </h1>

        {/* Subtext */}
        <p style={{
          color: "#777",
          maxWidth: "520px",
          lineHeight: "1.7",
          marginBottom: "40px",
          fontSize: "15px"
        }}>
          LogiSys manages high-demand product distribution using FIFO order ranking and time-slot allocation — so every customer knows exactly where they stand.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to={user ? "/app/dashboard" : "/signup"}>
            <button className="btn btn-cream" style={{ padding: '14px 28px', fontSize: '13px' }}>
              PLACE ORDER →
            </button>
          </Link>
          <button className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: '13px' }}>
            VIEW DEMO
          </button>
        </div>

      </section>

      {/* Feature cards */}
      <section className="fade-up" style={{
        padding: "0 40px 80px",
        position: "relative",
        zIndex: 2,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
        maxWidth: "900px",
      }}>
        {[
          { icon: "◷", title: "Time-Slot Allocation", desc: "Orders assigned to capacity-managed time windows automatically." },
          { icon: "≡", title: "FIFO Queue Ranking", desc: "First come, first served. Fair priority for every customer." },
          { icon: "◻", title: "Inventory Tracking", desc: "Real-time stock management with allocation-aware availability." },
        ].map((f, i) => (
          <div key={i} className="card-dark" style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            animation: `fadeUp 0.4s ease ${0.1 + i * 0.1}s both`,
          }}>
            <span style={{
              fontFamily: "var(--mono)",
              fontSize: "20px",
              color: "#ff3c3c",
            }}>{f.icon}</span>
            <h3 style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#f0f0f0",
            }}>{f.title}</h3>
            <p style={{
              fontSize: "13px",
              color: "#666",
              lineHeight: "1.6",
            }}>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Landing;