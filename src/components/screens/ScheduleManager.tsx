import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Play, Pause } from 'lucide-react';
import { useContentCache } from '@/hooks/useContentCache';

interface ScheduleManagerProps {
  screenId?: string;
}

export function ScheduleManager({ screenId }: ScheduleManagerProps) {
  const { schedule, getCurrentContent, getNextContent } = useContentCache(screenId);
  
  const currentContent = getCurrentContent();
  const nextContent = getNextContent();

  if (!schedule) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No schedule available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current & Next Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Play className="h-5 w-5 text-green-600" />
              Currently Playing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentContent ? (
              <div className="space-y-2">
                <p className="font-mono text-sm">{currentContent.id}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{currentContent.type.toUpperCase()}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(currentContent.scheduled_time).toLocaleTimeString()}
                  </span>
                </div>
                {currentContent.duration_seconds && (
                  <p className="text-xs text-muted-foreground">
                    Duration: {currentContent.duration_seconds}s
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Pause className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No content scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              Up Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextContent ? (
              <div className="space-y-2">
                <p className="font-mono text-sm">{nextContent.id}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{nextContent.type.toUpperCase()}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(nextContent.scheduled_time).toLocaleTimeString()}
                  </span>
                </div>
                {nextContent.duration_seconds && (
                  <p className="text-xs text-muted-foreground">
                    Duration: {nextContent.duration_seconds}s
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nothing scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.schedule.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No content scheduled for today</p>
                <Button variant="outline" className="mt-4">
                  View Booking Calendar
                </Button>
              </div>
            ) : (
              schedule.schedule.map((item, index) => {
                const isActive = currentContent?.id === item.id;
                const isPast = new Date(item.scheduled_time) < new Date() && !isActive;
                
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isActive 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                        : isPast
                        ? 'bg-muted/50 border-muted'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isActive ? 'text-green-600' : isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {new Date(item.scheduled_time).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className={`font-mono text-sm ${isActive ? 'text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                          {item.id}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={isActive ? "default" : isPast ? "secondary" : "outline"}
                            className="text-xs"
                          >
                            {item.type.toUpperCase()}
                          </Badge>
                          {item.duration_seconds && (
                            <span className="text-xs text-muted-foreground">
                              {item.duration_seconds}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <Badge variant="default" className="bg-green-600">
                          <Play className="h-3 w-3 mr-1" />
                          Playing
                        </Badge>
                      )}
                      {isPast && (
                        <Badge variant="secondary">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}