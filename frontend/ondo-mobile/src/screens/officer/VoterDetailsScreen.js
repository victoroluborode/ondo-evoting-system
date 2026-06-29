import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import SelectField from "../../components/SelectField";
import { ONDO_CONSTITUENCIES } from "../../constants/locations";
import { colors, spacing, typography, radius } from "../../theme";

export default function VoterDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    vin: "",
    phone: "",
    constituency: "",
    lga: "",
  });
  const [validating, setValidating] = useState(false);

  const constituencyNames = ONDO_CONSTITUENCIES.map((c) => c.name);
  const availableLgas = form.constituency
    ? ONDO_CONSTITUENCIES.find((c) => c.name === form.constituency)?.lgas || []
    : [];

  const handleSelectConstituency = (constituency) => {
    // Reset LGA whenever constituency changes, since the old LGA may not belong to the new constituency.
    setForm({ ...form, constituency, lga: "" });
  };

  
  const handleNext = () => {
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      if (form.vin.length < 5) {
        Alert.alert(
          "Invalid VIN",
          "The VIN provided failed validation against the registry.",
        );
        return;
      }
      if (form.phone.length < 10) {
        Alert.alert(
          "Invalid Phone Number",
          "Enter a valid phone number without the leading 0.",
        );
        return;
      }

      const fullName = [form.lastName, form.firstName, form.middleName]
        .filter(Boolean)
        .join(" ");

      navigation.navigate("Biometrics", {
        voterData: {
          ...form,
          name: fullName,
          phone: `+234${form.phone}`,
        },
      });
    }, 1500);
  };

  const isFormValid =
    form.lastName &&
    form.firstName &&
    form.vin &&
    form.phone &&
    form.constituency &&
    form.lga;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>Voter Details</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Enter the voter's information exactly as it appears on their ID.
        </Text>

        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <CustomInput
              label="Last Name"
              placeholder="Surname"
              value={form.lastName}
              onChangeText={(text) => setForm({ ...form, lastName: text })}
            />
          </View>
          <View style={styles.nameField}>
            <CustomInput
              label="First Name"
              placeholder="Given name"
              value={form.firstName}
              onChangeText={(text) => setForm({ ...form, firstName: text })}
            />
          </View>
        </View>

        <CustomInput
          label="Middle Name (optional)"
          placeholder="Middle name"
          value={form.middleName}
          onChangeText={(text) => setForm({ ...form, middleName: text })}
        />

        <CustomInput
          label="Voter Identification Number (VIN)"
          placeholder="19-digit alphanumeric code"
          autoCapitalize="characters"
          value={form.vin}
          onChangeText={(text) => setForm({ ...form, vin: text })}
        />

        <View style={styles.phoneWrap}>
          <Text style={typography.label}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+234</Text>
            </View>
            <View style={styles.phoneField}>
              <CustomInput
                placeholder="8012345678"
                keyboardType="phone-pad"
                maxLength={10}
                value={form.phone}
                onChangeText={(text) =>
                  setForm({ ...form, phone: text.replace(/[^0-9]/g, "") })
                }
              />
            </View>
          </View>
        </View>

        <SelectField
          label="Constituency"
          placeholder="Select the voter's constituency"
          value={form.constituency}
          options={constituencyNames}
          onSelect={handleSelectConstituency}
        />

        <SelectField
          label="LGA"
          placeholder={
            form.constituency
              ? "Select the voter's LGA"
              : "Select a constituency first"
          }
          value={form.lga}
          options={availableLgas}
          onSelect={(lga) => setForm({ ...form, lga })}
        />

        <CustomButton
          title="Validate & Continue"
          onPress={handleNext}
          loading={validating}
          disabled={!isFormValid}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  nameField: {
    flex: 1,
  },
  phoneWrap: {
    marginBottom: spacing.ml,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.xxs + 2,
  },
  phonePrefix: {
    height: 52,
    paddingHorizontal: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMid,
  },
  phoneField: {
    flex: 1,
  },
});
