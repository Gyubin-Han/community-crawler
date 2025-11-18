import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestConnection {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/community_aggregator";
        String username = "aggregator";
        String password = "password";

        System.out.println("=== JDBC Connection Test ===");
        System.out.println("URL: " + url);
        System.out.println("Username: " + username);
        System.out.println("Password: " + password);
        System.out.println("============================");

        try {
            System.out.println("Loading driver...");
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("Driver loaded successfully!");

            System.out.println("Connecting to database...");
            Connection conn = DriverManager.getConnection(url, username, password);
            System.out.println("✓ Connection successful!");
            System.out.println("Connection: " + conn);

            conn.close();
            System.out.println("✓ Connection closed successfully!");

        } catch (ClassNotFoundException e) {
            System.err.println("✗ Driver not found!");
            e.printStackTrace();
        } catch (SQLException e) {
            System.err.println("✗ Connection failed!");
            System.err.println("SQL State: " + e.getSQLState());
            System.err.println("Error Code: " + e.getErrorCode());
            System.err.println("Message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
