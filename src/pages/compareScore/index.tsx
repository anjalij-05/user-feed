import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchProfileDetails } from "@/app-api/nearbyProfiles";
import { fetchTlsScore } from "@/app-api/tls";
import { checkConnectionStatus } from "@/app-api/connections";
import { getUserProfileImage } from "@/lib/utils";
import DummyImage from "@/assets/dummy_image.webp";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import TlsImage from "@/assets/tlsImage.webp";
import { toast } from "sonner";

// Factor labels mapping
const factorLabels: Record<string, string> = {
  yourTotalExperience: "Total Experience",
  yourCurrentJob: "Current Job",
  eventYouAttend: "Event Attended",
  yourEducation: "Education",
  mediaPresence: "Social Media Presence",
  others: "Others",
};

const CompareTls: React.FC = () => {
  const { token, user } = useAppSelector((s) => s.auth);
  const { userProfiles } = useAppSelector((s) => s.connection);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const user1Id = params.get("user1");
  const initialUser2Id = params.get("user2");
  const navigate = useNavigate();
  const [user1Profile, setUser1Profile] = useState<any>(null);
  const [user2Profile, setUser2Profile] = useState<any>(null);
  const [user1TlsScore, setUser1TlsScore] = useState<number>(0);
  const [user2TlsScore, setUser2TlsScore] = useState<number>(0);
  const [user1TlsData, setUser1TlsData] = useState<any>(null);
  const [compareData, setCompareData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [selectedUser2Id, setSelectedUser2Id] = useState<string | null>(
    initialUser2Id,
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  console.log("user2Profile:", user2Profile);

  // Fetch connections list
  useEffect(() => {
    if (!token || !user?._id) return;

    const fetchConnections = async () => {
      setConnectionsLoading(true);
      try {
        await dispatch(
          checkConnectionStatus({ token, userId: user._id }),
        ).unwrap();
      } catch (err) {
        console.error("Failed to fetch connections:", err);
      } finally {
        setConnectionsLoading(false);
      }
    };

    fetchConnections();
  }, [token, user?._id, dispatch]);
  // Add this useEffect to track screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user1 profile (current user) - only once
  useEffect(() => {
    if (!user1Id || !token) return;

    const fetchUser1 = async () => {
      try {
        const profile1Res = await fetchProfileDetails(
          token,
          user1Id,
          user1Id,
          0,
          0,
          0,
        );
        const details1 = profile1Res?.result?.details;

        if (!details1) throw new Error("Your profile not found");
        if (!details1.mobileNumber) throw new Error("Mobile number missing");

        setUser1Profile(details1);

        // Fetch TLS score for user1
        const res1 = await dispatch(
          fetchTlsScore({ mobileNumber: details1.mobileNumber }),
        ).unwrap();

        setUser1TlsScore(res1.score || 0);
        setUser1TlsData(res1);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to fetch your profile");
      }
    };

    fetchUser1();
  }, [user1Id, token, dispatch]);

  // Fetch user2 profile and comparison data
  useEffect(() => {
    if (!selectedUser2Id || !token || !user1Profile || !user1TlsData) return;

    const fetchUser2AndCompare = async () => {
      setLoading(true);
      try {
        // Fetch user2 profile details
        const profile2Res = await fetchProfileDetails(
          token,
          user1Id!,
          selectedUser2Id,
          0,
          0,
          0,
        );
        const details2 = profile2Res?.result?.details;

        if (!details2) throw new Error("Profile not found");
        if (!details2.mobileNumber) throw new Error("Mobile number missing");

        setUser2Profile(details2);

        // Fetch TLS score for user2
        const res2 = await dispatch(
          fetchTlsScore({ mobileNumber: details2.mobileNumber }),
        ).unwrap();

        setUser2TlsScore(res2.score || 0);

        // Format comparison data
        const factors = Object.keys(user1TlsData.factorGroup || {});
        const formatted = factors.map((f) => ({
          name: factorLabels[f] || f,
          You: user1TlsData.factorGroup[f] || 0,
          Other: res2.factorGroup[f] || 0,
        }));

        setCompareData(formatted);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to fetch comparison data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser2AndCompare();
  }, [selectedUser2Id, user1Id, token, user1Profile, user1TlsData, dispatch]);

  const handleCompareWithConnection = (connectionId: string) => {
    // Update selected user without navigation
    setSelectedUser2Id(connectionId);
  };

  if (!user1Profile)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-3 bg-muted rounded-2xl mt-4">
      {/* Profile Cards with VS */}
      <div className="flex justify-center items-center gap-3 mb-4 pt-2">
        {/* User 1 Card */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-primary shadow-md">
            <img
              src={
                user1Profile.profileImage
                  ? getUserProfileImage(
                      user?.imageBaseUrl || "",
                      user1Profile.profileImage,
                    )
                  : DummyImage
              }
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="mt-2 font-semibold text-sm text-foreground capitalize">
            {user1Profile.firstName} {user1Profile.lastName}
          </h3>
        </div>

        {/* VS Text */}
        <div className="text-2xl font-bold text-gray-400 px-2">VS</div>

        {/* User 2 Card */}
        <div className="flex flex-col items-center">
          {loading ? (
            <div className="w-20 h-20 rounded-2xl border-3 border-primary shadow-md flex items-center justify-center bg-muted-foreground">
              <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user2Profile ? (
            <div
              className="w-20 h-20 rounded-2xl cursor-pointer overflow-hidden border-3 border-primary shadow-md"
              onClick={() =>
                navigate(
                  `/profile/${user2Profile.firstName.toLowerCase()}-${user2Profile.lastName.toLowerCase()}-${user2Profile._id}`,
                )
              }
            >
              <img
                src={
                  user2Profile.profileImage
                    ? getUserProfileImage(
                        user?.imageBaseUrl || "",
                        user2Profile.profileImage,
                      )
                    : DummyImage
                }
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-3xl border-4 border-gray-300 shadow-lg flex items-center justify-center bg-accent">
              <span className="text-accent-foreground text-xs text-center px-2">
                Select
                <br />
                Connection
              </span>
            </div>
          )}
          <h3 className="mt-3 font-semibold text-base text-foreground capitalize">
            {user2Profile
              ? `${user2Profile.firstName} ${user2Profile.lastName}`
              : "Select User"}
          </h3>
        </div>
      </div>

      {/* Line Chart */}
      {user2Profile && compareData.length > 0 && !loading && (
        <>
          <div className="bg-background mb-4 p-2 rounded-xl">
            <div className="w-full h-56">
              <ResponsiveContainer>
                <LineChart
                  data={compareData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: isMobile ? 40 : 5,
                  }}
                  barCategoryGap="10%"
                >
                  <CartesianGrid stroke="#f0f0f0" className="stroke-0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: isMobile ? 8 : 10 }}
                    interval={0}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 80 : 60}
                    scale="point"
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    domain={[0, 20]}
                    ticks={[0, 10, 20]}
                  />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: "14px", paddingTop: "10px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="You"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3b82f6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Other"
                    stroke="#fb923c"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#fb923c" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TLS Score Badges */}
          <div className="flex justify-center gap-6 mb-4">
            <div className="bg-primary/20 rounded-xl px-5 py-2 flex items-center gap-1.5">
              <span className="text-primary font-bold text-sm">TL</span>
              <span className="text-primary font-bold text-lg">
                {user1TlsScore}
              </span>
            </div>
            <div className="bg-primary/20 rounded-xl px-5 py-2 flex items-center gap-1.5">
              <span className="text-primary font-bold text-sm">TL</span>
              <span className="text-primary font-bold text-lg">
                {user2TlsScore}
              </span>
            </div>
          </div>

          {/* Factor Details Table */}
          <div className="bg-background mb-4 p-2 rounded-xl">
            <div className="divide-y divide-muted">
              {compareData.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between py-2.5 px-2"
                >
                  <div className="w-12 text-center font-bold text-sm text-foreground">
                    {f.You ?? 0}
                  </div>
                  <div className="flex-1 text-center text-xs text-muted-foreground">
                    {f.name}
                  </div>
                  <div className="w-12 text-center font-bold text-sm text-foreground">
                    {f.Other ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Loading state for comparison data */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Connections List */}
      <div className="mt-4 pb-4">
        <h2 className="text-base font-bold text-foreground mb-3">
          {user2Profile
            ? "Compare with Other Connections"
            : "Select a Connection to Compare"}
        </h2>

        {connectionsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : userProfiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {userProfiles.map((connection) => (
              <div
                key={connection._id}
                onClick={() => handleCompareWithConnection(connection._id)}
                className={`flex flex-col items-center p-2.5 bg-background border-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  selectedUser2Id === connection._id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-muted hover:border-primary/30"
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-primary">
                  <img
                    src={
                      connection.profileImage
                        ? getUserProfileImage(
                            user?.imageBaseUrl || "",
                            connection.profileImage,
                          )
                        : DummyImage
                    }
                    alt={`${connection.first_name} ${connection.last_name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="mt-1.5 text-xs font-semibold text-foreground text-center line-clamp-2 capitalize">
                  {connection.first_name} {connection.last_name}
                </h4>
                <h4 className="mt-1 text-xs font-semibold text-foreground/80 text-center line-clamp-2 capitalize">
                  {connection.designation}
                </h4>
                <div className="relative inline-block">
                  <img
                    src={TlsImage}
                    alt="TLS"
                    className="w-16 h-10 object-contain"
                  />
                  <span className="absolute inset-y-0 right-3 top-1 flex items-center text-white font-semibold text-xs">
                    {connection.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4 text-sm">
            No connections found. Connect with others to compare TLS scores.
          </p>
        )}
      </div>
    </div>
  );
};

export default CompareTls;
