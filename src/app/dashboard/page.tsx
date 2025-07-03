'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  User,
  Target,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  Eye,
  Camera,
  RefreshCw,
  Trophy,
  Zap,
  Globe,
} from 'lucide-react';
import type { ObservationPoint } from '@/types/observations';
import { SPECIES_GROUP_COLORS } from '@/types/observations';
import { smartPrefetch } from '@/lib/prefetching';

interface DashboardStats {
  totalObservations: number;
  totalSpecies: number;
  totalLocations: number;
  totalPhotos: number;
  mostActiveMonth: string;
  favoriteSpeciesGroup: string;
  observationStreak: number;
  averagePerMonth: number;
}

interface MonthlyActivity {
  month: string;
  observations: number;
  species: number;
}

interface SpeciesGroupData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyActivity[]>([]);
  const [speciesGroupData, setSpeciesGroupData] = useState<SpeciesGroupData[]>(
    []
  );

  const fetchObservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/observations?limit=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch observations');
      }

      const data = await response.json();
      const obsData = data.results || [];
      calculateStats(obsData);

      // Trigger smart prefetching for dashboard context
      smartPrefetch({
        page: 'dashboard',
        data: obsData,
      }).catch(console.warn);
    } catch (err) {
      console.error('Error fetching observations:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObservations();
  }, [fetchObservations]);

  const calculateStats = (observations: ObservationPoint[]) => {
    if (observations.length === 0) return;

    const uniqueSpecies = new Set(
      observations.map((obs) => obs.species_detail?.id || obs.species)
    );
    const uniqueLocations = new Set(
      observations.map((obs) => obs.location_detail?.id || obs.location)
    );
    const totalPhotos = observations.reduce(
      (sum, obs) => sum + (obs.photos?.length || 0),
      0
    );

    // Monthly activity
    const monthlyMap = new Map<
      string,
      { observations: number; species: Set<number> }
    >();
    const speciesGroupMap = new Map<string, number>();

    observations.forEach((obs) => {
      if (obs.date) {
        const month = new Date(obs.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, { observations: 0, species: new Set() });
        }
        const monthData = monthlyMap.get(month)!;
        monthData.observations++;
        if (obs.species_detail?.id) {
          monthData.species.add(obs.species_detail.id);
        }
      }

      // Species groups
      const groupName = obs.species_detail?.group_name || 'Unknown';
      speciesGroupMap.set(groupName, (speciesGroupMap.get(groupName) || 0) + 1);
    });

    // Convert to arrays for charts
    const monthlyActivity = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        observations: data.observations,
        species: data.species.size,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12); // Last 12 months

    const speciesGroups = Array.from(speciesGroupMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / observations.length) * 100),
        color: SPECIES_GROUP_COLORS[name] || SPECIES_GROUP_COLORS.default,
      }))
      .sort((a, b) => b.count - a.count);

    const mostActiveMonth = monthlyActivity.reduce((max, current) =>
      current.observations > max.observations ? current : max
    ).month;

    const favoriteSpeciesGroup = speciesGroups[0]?.name || 'Unknown';

    setStats({
      totalObservations: observations.length,
      totalSpecies: uniqueSpecies.size,
      totalLocations: uniqueLocations.size,
      totalPhotos,
      mostActiveMonth,
      favoriteSpeciesGroup,
      observationStreak: calculateStreak(observations),
      averagePerMonth: Math.round(
        observations.length / Math.max(monthlyActivity.length, 1)
      ),
    });

    setMonthlyData(monthlyActivity);
    setSpeciesGroupData(speciesGroups);
  };

  const calculateStreak = (observations: ObservationPoint[]): number => {
    if (observations.length === 0) return 0;

    const dates = observations
      .map((obs) => (obs.date ? new Date(obs.date).toDateString() : null))
      .filter(Boolean)
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime());

    let streak = 0;
    let currentDate = new Date();

    for (const dateStr of dates) {
      const obsDate = new Date(dateStr!);
      const diffDays = Math.floor(
        (currentDate.getTime() - obsDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= streak + 1) {
        streak++;
        currentDate = obsDate;
      } else {
        break;
      }
    }

    return streak;
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={fetchObservations}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
            <p className="text-muted-foreground">
              Your observation statistics and achievements
            </p>
          </div>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className="gap-2">
            <Trophy className="w-4 h-4" />
            Nature Explorer
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Observations
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalObservations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.averagePerMonth} per month average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Species Observed
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalSpecies.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique species in your life list
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Locations Visited
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLocations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Different observation sites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photos Taken</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPhotos.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Nature photography portfolio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="species">Species</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Most Active Month</span>
                  <Badge variant="outline">{stats.mostActiveMonth}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Favorite Species Group
                  </span>
                  <Badge variant="outline">{stats.favoriteSpeciesGroup}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Streak</span>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">
                      {stats.observationStreak} days
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Average</span>
                  <span className="font-medium">
                    {stats.averagePerMonth} observations
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Progress Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Species Goal (1000)</span>
                    <span>{stats.totalSpecies}/1000</span>
                  </div>
                  <Progress
                    value={(stats.totalSpecies / 1000) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Observation Goal (5000)</span>
                    <span>{stats.totalObservations}/5000</span>
                  </div>
                  <Progress
                    value={(stats.totalObservations / 5000) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Location Goal (100)</span>
                    <span>{stats.totalLocations}/100</span>
                  </div>
                  <Progress
                    value={(stats.totalLocations / 100) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Monthly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="observations"
                      fill="#3B82F6"
                      name="Observations"
                    />
                    <Bar dataKey="species" fill="#10B981" name="Species" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="species" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Species Groups Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={speciesGroupData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ name, percentage }) =>
                          `${name} ${percentage}%`
                        }
                      >
                        {speciesGroupData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {speciesGroupData.slice(0, 8).map((group) => (
                    <div
                      key={group.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="text-sm font-medium">
                          {group.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{group.count}</div>
                        <div className="text-xs text-muted-foreground">
                          {group.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Achievement Cards */}
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">First Observer</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Record your first observation
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="bg-yellow-500">
                  Completed
                </Badge>
              </CardContent>
            </Card>

            <Card
              className={
                stats.totalSpecies >= 100
                  ? 'border-2 border-green-200 bg-green-50'
                  : ''
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      stats.totalSpecies >= 100 ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Century Club</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Observe 100 different species
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress
                    value={(stats.totalSpecies / 100) * 100}
                    className="h-2"
                  />
                  <div className="text-sm text-muted-foreground">
                    {stats.totalSpecies}/100 species
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={
                stats.observationStreak >= 7
                  ? 'border-2 border-orange-200 bg-orange-50'
                  : ''
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      stats.observationStreak >= 7
                        ? 'bg-orange-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Weekly Streak</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Observe for 7 consecutive days
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress
                    value={(stats.observationStreak / 7) * 100}
                    className="h-2"
                  />
                  <div className="text-sm text-muted-foreground">
                    {stats.observationStreak}/7 days
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
