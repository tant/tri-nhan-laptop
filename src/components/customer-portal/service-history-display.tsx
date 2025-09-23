import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, History, Package, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useCustomerPortal, type ServiceHistoryEntry } from "@/hooks/use-customer-portal";

interface ServiceHistoryDisplayProps {
  customerPhone: string;
  onClose: () => void;
}

export function ServiceHistoryDisplay({ customerPhone, onClose }: ServiceHistoryDisplayProps) {
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { getServiceHistory, getVietnameseStatus, formatCurrency } = useCustomerPortal();

  useEffect(() => {
    const loadServiceHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await getServiceHistory(customerPhone);
        setServiceHistory(history);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (customerPhone) {
      loadServiceHistory();
    }
  }, [customerPhone, getServiceHistory]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "secondary" | "outline" | "default"; icon: any }> = {
      received: { variant: "secondary", icon: Clock },
      diagnosed: { variant: "outline", icon: CheckCircle },
      waiting_parts: { variant: "outline", icon: Package },
      in_progress: { variant: "default", icon: Clock },
      completed: { variant: "default", icon: CheckCircle },
      ready_for_pickup: { variant: "default", icon: CheckCircle },
      delivered: { variant: "default", icon: CheckCircle },
      cancelled: { variant: "outline", icon: AlertCircle }
    };
    return statusMap[status] || { variant: "outline" as const, icon: AlertCircle };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#299fce]" />
            Lịch Sử Dịch Vụ
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">Không thể tải lịch sử dịch vụ</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </CardContent>
            </Card>
          ) : serviceHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chưa có lịch sử dịch vụ</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {serviceHistory.map((entry) => {
                const { date, time } = formatDate(entry.created_at);
                const statusInfo = getStatusBadge(entry.status);
                const IconComponent = statusInfo.icon;

                return (
                  <Card key={entry.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">#{entry.ticket_code}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {entry.device_info.brand} {entry.device_info.model}
                          </p>
                        </div>
                        <Badge variant={statusInfo.variant} className="shrink-0">
                          <IconComponent className="w-3 h-3 mr-1" />
                          {getVietnameseStatus(entry.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Vấn đề</p>
                        <p className="text-sm">{entry.issue_description}</p>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">Ngày tiếp nhận</p>
                          <p>{date} - {time}</p>
                        </div>
                        {entry.warranty_until && (
                          <div>
                            <p className="font-medium text-gray-600">Bảo hành đến</p>
                            <p>{formatDate(entry.warranty_until).date}</p>
                          </div>
                        )}
                        {entry.total_cost && (
                          <div>
                            <p className="font-medium text-gray-600">Chi phí thực tế</p>
                            <p className="font-bold text-[#299fce]">
                              {formatCurrency(entry.total_cost)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Tổng cộng: {serviceHistory.length} phiếu dịch vụ
            </p>
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}