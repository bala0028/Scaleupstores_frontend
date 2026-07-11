import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/admin/components/ui/Card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/admin/components/ui/Switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/admin/components/ui/Button";
import {
  Home,
  MessageCircle,
  Settings,
  Pencil,
} from "lucide-react";
import { Link } from "react-router-dom";
import { platformSettingsData, conversationsData, projectsData } from "@/admin/data";

export function Profile() {
  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border">
        <CardContent className="p-4">
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-16 w-16 rounded-lg shadow-sm">
                <AvatarImage src="/img/bruce-mars.jpeg" alt="bruce-mars" />
                <AvatarFallback>RD</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">Richard Davis</h3>
                <p className="text-sm text-muted-foreground">CEO / Co-Founder</p>
              </div>
            </div>
            <div className="w-96">
              <Tabs defaultValue="app">
                <TabsList>
                  <TabsTrigger value="app">
                    <Home className="-mt-1 mr-2 inline-block h-5 w-5" />
                    App
                  </TabsTrigger>
                  <TabsTrigger value="message">
                    <MessageCircle className="-mt-0.5 mr-2 inline-block h-5 w-5" />
                    Message
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="-mt-1 mr-2 inline-block h-5 w-5" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid grid-cols-1 mb-12 gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
            {/* Platform Settings */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Platform Settings</h4>
              <div className="flex flex-col gap-12">
                {platformSettingsData.map(({ title, options }: any) => (
                  <div key={title}>
                    <span className="mb-4 block text-xs font-semibold uppercase text-muted-foreground">
                      {title}
                    </span>
                    <div className="flex flex-col gap-6">
                      {options.map(({ checked, label }: { checked: boolean; label: string }) => (
                        <div key={label} className="flex items-center gap-2">
                          <Switch id={label} defaultChecked={checked} />
                          <Label htmlFor={label} className="text-sm text-muted-foreground">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">Profile Information</h4>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Pencil className="h-4 w-4 cursor-pointer text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Edit Profile</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Hi, I'm Alec Thompson, Decisions: If you can't decide, the answer is no.
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>First Name:</strong> Alec M. Thompson
                </li>
                <li>
                  <strong>Mobile:</strong> (44) 123 1234 123
                </li>
                <li>
                  <strong>Email:</strong> alecthompson@mail.com
                </li>
                <li>
                  <strong>Location:</strong> USA
                </li>
                <li>
                  <strong>Social:</strong>
                  <span className="inline-flex items-center gap-4 ml-2">
                    <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <svg
                      className="w-5 h-5 text-purple-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </span>
                </li>
              </ul>
            </div>

            {/* Conversations */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Platform Settings</h4>
              <ul className="flex flex-col gap-6">
                {conversationsData.map((props: any) => (
                  <li key={props.name} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="rounded-lg shadow">
                        <AvatarImage src={props.img} alt={props.name} />
                        <AvatarFallback>{props.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-semibold text-foreground">{props.name}</span>
                        <span className="block text-xs text-muted-foreground">{props.message}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      reply
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Projects */}
          <div className="px-4 pb-4">
            <h4 className="text-lg font-semibold text-foreground mb-2">Projects</h4>
            <p className="text-sm text-muted-foreground">Architects design houses</p>
            <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-4">
              {projectsData.map(({ img, title, description, tag, route, members }: any) => (
                <Card key={title} className="bg-transparent shadow-none">
                  <CardHeader className="mx-0 mt-0 mb-4 h-64 xl:h-40 overflow-hidden rounded-lg">
                    <img src={img} alt={title} className="h-full w-full object-cover" />
                  </CardHeader>
                  <CardContent className="py-0 px-1">
                    <span className="text-sm text-muted-foreground">{tag}</span>
                    <h5 className="text-lg font-semibold text-foreground mt-1 mb-2">{title}</h5>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                  <CardFooter className="mt-6 flex items-center justify-between py-0 px-1">
                    <Link to={route}>
                      <Button variant="outline" size="sm">
                        view project
                      </Button>
                    </Link>
                    <div className="flex -space-x-2">
                      {members?.map(({ img, name }: { img: string; name: string }) => (
                        <TooltipProvider key={name}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Avatar className="h-6 w-6 border-2 border-white">
                                <AvatarImage src={img} alt={name} />
                                <AvatarFallback>{name?.[0]}</AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>{name}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default Profile;
