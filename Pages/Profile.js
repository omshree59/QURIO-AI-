import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Camera, 
  Edit, 
  Save, 
  X,
  Trophy,
  Target,
  Calendar,
  Mail,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setEditData({
        full_name: currentUser.full_name || '',
        bio: currentUser.bio || '',
        avatar_url: currentUser.avatar_url || '',
        learning_preferences: currentUser.learning_preferences || {}
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setLoading(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setEditData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        full_name: editData.full_name,
        bio: editData.bio,
        avatar_url: editData.avatar_url,
        learning_preferences: editData.learning_preferences
      });
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditData({
      full_name: user.full_name || '',
      bio: user.bio || '',
      avatar_url: user.avatar_url || '',
      learning_preferences: user.learning_preferences || {}
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-slate-700 rounded-xl"></div>
            <div className="lg:col-span-2 h-96 bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const userStats = user?.statistics || {};
  const accuracy = userStats.total_questions > 0 
    ? Math.round((userStats.correct_answers / userStats.total_questions) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Profile</h1>
          <p className="text-slate-400 mt-2">Manage your learning profile and preferences</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 mx-auto border-4 border-gradient-to-r from-purple-500 to-pink-500">
                  <AvatarImage src={editData.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                    >
                      {uploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-300">Full Name</Label>
                      <Input
                        value={editData.full_name}
                        onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Bio</Label>
                      <Textarea
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="bg-slate-700/50 border-slate-600 text-white h-20"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">{user?.full_name || 'Anonymous Learner'}</h2>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </p>
                    {user?.bio && (
                      <p className="text-slate-300 text-sm mt-3 p-3 bg-slate-700/30 rounded-lg">
                        {user.bio}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Role Badge */}
              <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
                <UserIcon className="w-3 h-3 mr-1" />
                {user?.role || 'Learner'}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats and Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Learning Stats */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Learning Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{userStats.total_quizzes || 0}</div>
                  <div className="text-slate-400 text-sm">Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{accuracy}%</div>
                  <div className="text-slate-400 text-sm">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{userStats.current_streak || 0}</div>
                  <div className="text-slate-400 text-sm">Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{userStats.badges?.length || 0}</div>
                  <div className="text-slate-400 text-sm">Badges</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Learning Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Daily Goal (quizzes)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={editData.learning_preferences?.daily_goal || 5}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        learning_preferences: {
                          ...prev.learning_preferences,
                          daily_goal: parseInt(e.target.value)
                        }
                      }))}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Preferred Difficulty</Label>
                    <select
                      value={editData.learning_preferences?.preferred_difficulty || 'medium'}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        learning_preferences: {
                          ...prev.learning_preferences,
                          preferred_difficulty: e.target.value
                        }
                      }))}
                      className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="adaptive">Adaptive</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Daily Goal</span>
                    <span className="text-white font-semibold">
                      {user?.learning_preferences?.daily_goal || 5} quizzes
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Preferred Difficulty</span>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                      {user?.learning_preferences?.preferred_difficulty || 'Medium'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Member Since</span>
                    <span className="text-white font-semibold">
                      {new Date(user?.created_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements Preview */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userStats.badges && userStats.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userStats.badges.slice(0, 6).map((badge, index) => (
                    <Badge
                      key={index}
                      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30"
                    >
                      🏆 {badge.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No achievements yet. Start taking quizzes to earn badges!</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}