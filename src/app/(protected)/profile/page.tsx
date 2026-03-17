"use client";
import Male from "../../../../public/avatars/male.png";
import { trimText } from "@/fullStackUtils/utils/functions";
import { toTitleCase } from "@/fullStackUtils/utils/functions";
import { useStudentData } from "@/context/StudentContext";
import Female from "../../../../public/avatars/female.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
    const { profile } = useStudentData();

    const avatarSrc =
        (profile?.gender?.toLowerCase() === "male"
        ? Male.src
        : profile?.gender?.toLowerCase() === "female"
        ? Female.src
        : Male.src);

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Student Profile</h2>
                <p className="text-muted-foreground">
                    Your Academic Information
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="bg-university-700 text-white text-2xl">
                                    <img
                                        src={avatarSrc}
                                        alt={toTitleCase(profile?.studentName || "")}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-xl">{toTitleCase(profile?.studentName || "")}</CardTitle>
                        <CardDescription>{profile?.registerNo || ""}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground">{trimText(profile?.program, 20)}</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Student Details</CardTitle>
                        <CardDescription>Your Academic Information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Institution</h4>
                                    <p>{profile?.institution}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Department</h4>
                                    <p>{profile?.program}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Semester</h4>
                                    <p>{profile?.semester}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Section</h4>
                                    <p>{profile?.section}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">DOB</h4>
                                    <p>{profile?.dob}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Gender</h4>
                                    <p>{profile?.gender}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <h4 className="font-medium">Note:</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    The Data Displayed Is Sourced From Srmap Student Portal.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;