import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Save, RotateCcw, Eye, Bell, ArrowUp, ArrowDown, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { signalFormSchema, type SignalFormData, calculateRiskReward } from "@/lib/validation";

interface TakeProfit {
  price: string;
  ratio?: string;
}

export function SignalComposer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [takeProfits, setTakeProfits] = useState<TakeProfit[]>([]);

  const form = useForm<SignalFormData>({
    resolver: zodResolver(signalFormSchema),
    defaultValues: {
      side: undefined,
      instrument: "",
      entry: "",
      stopLoss: "",
      takeProfits: [],
      riskTag: undefined,
      tradingViewLink: "",
      notes: "",
    },
  });

  const createSignalMutation = useMutation({
    mutationFn: async (data: SignalFormData) => {
      return apiRequest("POST", "/api/signals", data);
    },
    onSuccess: () => {
      toast({
        title: "Signal sent successfully",
        description: "Notifications have been sent to all subscribers",
      });
      form.reset();
      setTakeProfits([]);
      queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send signal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const watchedValues = form.watch();

  // Update take profits in form when local state changes
  useEffect(() => {
    form.setValue("takeProfits", takeProfits);
  }, [takeProfits, form]);

  // Calculate R/R ratios when values change
  useEffect(() => {
    if (watchedValues.entry && watchedValues.stopLoss) {
      const entry = parseFloat(watchedValues.entry);
      const stopLoss = parseFloat(watchedValues.stopLoss);
      const isLong = watchedValues.side === "BUY" || watchedValues.side === "BUY_LIMIT";

      if (!isNaN(entry) && !isNaN(stopLoss) && entry !== stopLoss) {
        setTakeProfits(prev => 
          prev.map(tp => {
            const tpPrice = parseFloat(tp.price);
            if (!isNaN(tpPrice)) {
              const ratio = calculateRiskReward(entry, stopLoss, tpPrice, isLong);
              return { ...tp, ratio: `${ratio.toFixed(1)}R` };
            }
            return tp;
          })
        );
      }
    }
  }, [watchedValues.entry, watchedValues.stopLoss, watchedValues.side]);

  const addTakeProfit = () => {
    if (takeProfits.length < 5) {
      setTakeProfits(prev => [...prev, { price: "" }]);
    }
  };

  const removeTakeProfit = (index: number) => {
    setTakeProfits(prev => prev.filter((_, i) => i !== index));
  };

  const updateTakeProfitPrice = (index: number, price: string) => {
    setTakeProfits(prev => 
      prev.map((tp, i) => i === index ? { ...tp, price } : tp)
    );
  };

  const onSubmit = (data: SignalFormData) => {
    createSignalMutation.mutate(data);
  };

  const clearForm = () => {
    form.reset();
    setTakeProfits([]);
  };

  // Preview data
  const previewData = {
    ...watchedValues,
    takeProfits,
  };

  const signalTypeConfig = {
    BUY: { class: "signal-buy text-white", icon: ArrowUp },
    SELL: { class: "signal-sell text-white", icon: ArrowDown },
    BUY_LIMIT: { class: "signal-limit text-white", icon: ArrowUp },
    SELL_LIMIT: { class: "signal-limit text-white", icon: ArrowDown },
  };

  const riskColors = {
    SAFE: "bg-chart-2 text-black",
    NORMAL: "bg-chart-3 text-black",
    RISKY: "bg-destructive text-destructive-foreground"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Compose Form */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Compose Signal</h1>
            <p className="text-muted-foreground">Create a new trading signal for subscribers</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="signal-form">
          {/* Signal Type & Instrument */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="side">Signal Type</Label>
              <Select onValueChange={(value) => form.setValue("side", value as any)} data-testid="select-signal-type">
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                  <SelectItem value="BUY_LIMIT">BUY LIMIT</SelectItem>
                  <SelectItem value="SELL_LIMIT">SELL LIMIT</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.side && (
                <p className="text-sm text-destructive">{form.formState.errors.side.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="instrument">Instrument</Label>
              <Input
                {...form.register("instrument")}
                placeholder="e.g., EURUSD, GBPJPY"
                data-testid="input-instrument"
              />
              {form.formState.errors.instrument && (
                <p className="text-sm text-destructive">{form.formState.errors.instrument.message}</p>
              )}
            </div>
          </div>

          {/* Entry & Stop Loss */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry">Entry Price</Label>
              <Input
                {...form.register("entry")}
                type="number"
                step="0.00001"
                placeholder="1.08450"
                className="font-mono"
                data-testid="input-entry"
              />
              {form.formState.errors.entry && (
                <p className="text-sm text-destructive">{form.formState.errors.entry.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                {...form.register("stopLoss")}
                type="number"
                step="0.00001"
                placeholder="1.08200"
                className="font-mono"
                data-testid="input-stop-loss"
              />
              {form.formState.errors.stopLoss && (
                <p className="text-sm text-destructive">{form.formState.errors.stopLoss.message}</p>
              )}
            </div>
          </div>

          {/* Take Profit Levels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Take Profit Levels</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTakeProfit}
                disabled={takeProfits.length >= 5}
                data-testid="button-add-tp"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add TP
              </Button>
            </div>
            <div className="space-y-2">
              {takeProfits.map((tp, index) => (
                <div key={index} className="flex items-center space-x-2" data-testid={`tp-row-${index}`}>
                  <span className="text-sm text-muted-foreground w-8">TP{index + 1}:</span>
                  <Input
                    type="number"
                    step="0.00001"
                    placeholder="0.00000"
                    value={tp.price}
                    onChange={(e) => updateTakeProfitPrice(index, e.target.value)}
                    className="flex-1 font-mono"
                    data-testid={`input-tp-${index}`}
                  />
                  <span className="text-sm text-muted-foreground w-16 text-right" data-testid={`tp-ratio-${index}`}>
                    {tp.ratio || "–"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTakeProfit(index)}
                    className="h-auto p-1"
                    data-testid={`button-remove-tp-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {takeProfits.length === 0 && (
                <p className="text-sm text-muted-foreground">No take profit levels added</p>
              )}
            </div>
          </div>

          {/* Risk Level & TradingView Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskTag">Risk Level</Label>
              <Select onValueChange={(value) => form.setValue("riskTag", value as any)} data-testid="select-risk-tag">
                <SelectTrigger>
                  <SelectValue placeholder="Optional..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAFE">SAFE</SelectItem>
                  <SelectItem value="NORMAL">NORMAL</SelectItem>
                  <SelectItem value="RISKY">RISKY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradingViewLink">TradingView Link</Label>
              <Input
                {...form.register("tradingViewLink")}
                type="url"
                placeholder="https://tradingview.com/..."
                data-testid="input-tradingview"
              />
              {form.formState.errors.tradingViewLink && (
                <p className="text-sm text-destructive">{form.formState.errors.tradingViewLink.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              {...form.register("notes")}
              rows={3}
              placeholder="Optional analysis or comments..."
              className="resize-none"
              data-testid="textarea-notes"
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">{form.formState.errors.notes.message}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="submit"
              disabled={createSignalMutation.isPending}
              className="flex items-center space-x-2"
              data-testid="button-send-signal"
            >
              <Send className="h-4 w-4" />
              <span>{createSignalMutation.isPending ? "Sending..." : "Send Signal"}</span>
            </Button>
            <Button type="button" variant="secondary" data-testid="button-save-draft">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button type="button" variant="ghost" onClick={clearForm} data-testid="button-clear">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {form.formState.errors.root && (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}
        </form>
      </div>

      {/* Live Preview */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Eye className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Live Preview</h2>
            <p className="text-muted-foreground">How subscribers will see this signal</p>
          </div>
        </div>

        {/* Preview Signal Card */}
        <Card data-testid="signal-preview">
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {previewData.side ? (
                  <Badge className={`${signalTypeConfig[previewData.side].class} px-3 py-1 flex items-center space-x-1`}>
                    {(() => {
                      const Icon = signalTypeConfig[previewData.side].icon;
                      return <Icon className="h-3 w-3" />;
                    })()}
                    <span>{previewData.side.replace('_', ' ')}</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1 flex items-center space-x-1">
                    <span>TYPE</span>
                  </Badge>
                )}
                <h3 className="text-lg font-semibold" data-testid="preview-instrument">
                  {previewData.instrument || "Instrument"}
                </h3>
                {previewData.riskTag && (
                  <Badge className={`${riskColors[previewData.riskTag]} text-xs`}>
                    {previewData.riskTag}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Just now</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Entry</div>
                <div className="text-lg font-mono font-bold text-foreground" data-testid="preview-entry">
                  {previewData.entry ? parseFloat(previewData.entry).toFixed(5) : "0.00000"}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Stop Loss</div>
                <div className="text-lg font-mono font-bold text-destructive" data-testid="preview-stop-loss">
                  {previewData.stopLoss ? parseFloat(previewData.stopLoss).toFixed(5) : "0.00000"}
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Risk/Reward</div>
                <div className="text-lg font-mono font-bold text-foreground" data-testid="preview-rr">
                  {takeProfits[0]?.ratio || "–"}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-2">Take Profit Levels</div>
              <div className="flex flex-wrap gap-2" data-testid="preview-take-profits">
                {takeProfits.length > 0 ? (
                  takeProfits.map((tp, index) => (
                    <div key={index} className="bg-accent rounded-lg p-2 flex items-center space-x-2">
                      <span className="text-xs text-accent-foreground">TP{index + 1}:</span>
                      <span className="font-mono font-medium text-accent-foreground">
                        {tp.price ? parseFloat(tp.price).toFixed(5) : "0.00000"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tp.ratio || "–"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="bg-muted rounded-lg p-2 flex items-center space-x-2 text-muted-foreground">
                    <span className="text-xs">No take profits added</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3">
              <div className="flex items-center space-x-4">
                <span>Signal #Preview</span>
                <span className="flex items-center space-x-1">
                  <span>0 read</span>
                </span>
              </div>
              <div className="text-xs">
                <strong>Disclaimer:</strong> Trading involves risk.
              </div>
            </div>

            <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full"></div>
          </CardContent>
        </Card>

        {/* Notification Preview */}
        <Card data-testid="notification-preview">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Bell className="h-4 w-4 mr-2 text-primary" />
              Notification Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4">
              <div className="font-medium text-sm mb-2" data-testid="notification-title">
                {previewData.side && previewData.instrument 
                  ? `${previewData.side.replace('_', ' ')} · ${previewData.instrument}`
                  : "Signal Title"
                }
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-line" data-testid="notification-body">
                {`Hi {FirstName},

Entry: ${previewData.entry || "0.00000"} | SL: ${previewData.stopLoss || "0.00000"} | TP(s): ${
                  takeProfits.length > 0 
                    ? takeProfits.map((tp, i) => `TP${i+1}: ${tp.price || "0.00000"}`).join(", ")
                    : "–"
                }
R/R: ${takeProfits.map(tp => tp.ratio).filter(Boolean).join("; ") || "–"}${
                  previewData.riskTag ? `\n${previewData.riskTag}` : ""
                }`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
