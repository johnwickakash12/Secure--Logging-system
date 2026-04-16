import java.net.URI;
import java.net.http.*;
public class amountfetch{
    static String[] ones = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"};
    static String[] tens = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};

    static String belowHundred(long n) {
        if (n < 20) return ones[(int) n];
        return tens[(int) (n / 10)] + (n % 10 != 0 ? " " + ones[(int) (n % 10)] : "");
    }

    static String belowThousand(long n) {
        if (n < 100) return belowHundred(n);
        return ones[(int) (n / 100)] + " Hundred" + (n % 100 != 0 ? " and " + belowHundred(n % 100) : "");
    }

    static String toWords(long n) {
        if (n == 0) return "Zero";
        String result = "";
        if (n / 10000000 > 0)                result += belowThousand(n / 10000000) + " Crore ";
        if ((n % 10000000) / 100000 > 0)     result += belowHundred((n % 10000000) / 100000) + " Lakh ";
        if ((n % 100000) / 1000 > 0)         result += belowThousand((n % 100000) / 1000) + " Thousand ";
        if (n % 1000 > 0)                    result += belowThousand(n % 1000);
        return result.trim();
    }


    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr"))
                .build();

        String body = client.send(request, HttpResponse.BodyHandlers.ofString()).body();

        String token = "\"inr\":";
        long inr = Long.parseLong(body.substring(body.indexOf(token) + token.length(),
                body.indexOf("}", body.indexOf(token))).trim());

        System.out.println("Bitcoin = Rs." + inr);
        System.out.println("In Words: Rupees " + toWords(inr) + " Only");
    }}