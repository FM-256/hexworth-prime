# Adopting the SAMM into your software development practices

After completing this episode, you should understand:

+ *Exam Objective 8.1.2 Maturity models (e.g., Capability Maturity Model (CMM), Software Assurance Maturity Model (SAMM))

**Description:** In this episode, we will examine  how the Software Assurance Maturity Model (SAMM)) improve an organization's software development practices and secure software development.



### SAMM Structure

SAMM is organized around five business functions, each encompassing several security practices. The business functions are:

1. **Governance**: Establishing an organization's overall approach to security management.
2. **Design**: Ensuring that security is an integral part of the software design process.
3. **Implementation**: Integrating security practices into the development and coding phases.
4. **Verification**: Conducting activities to verify the security of software through testing and review processes.
5. **Operations**: Managing security in deployed software and throughout its operational lifecycle.

### Characteristic Practices

#### Governance

- **Policy & Compliance**: Develop and maintain a security policy that complies with legal and regulatory requirements.
- **Education & Guidance**: Provide ongoing security training and awareness programs for all relevant stakeholders.
- **Metric & Improvement**: Establish security metrics to measure program effectiveness and drive continuous improvement.

#### Design

- **Threat Assessment**: Conduct regular threat modeling and risk assessments during the software design phase.
- **Security Requirements**: Define and maintain security requirements that software projects must adhere to.
- **Secure Architecture**: Develop a secure architecture that incorporates security controls and mitigations for identified risks.

#### Implementation

- **Secure Build**: Implement processes to ensure that software builds are securely generated and maintained.
- **Secure Deployment**: Establish procedures for secure software deployment and configuration.
- **Defect Management**: Create a system for tracking and managing security defects found during development.

#### Verification

- **Architecture Assessment**: Perform security assessments of software architectures to identify potential vulnerabilities.
- **Code Review**: Conduct regular code reviews with a focus on identifying security issues.
- **Security Testing**: Implement comprehensive security testing procedures, including static and dynamic analysis, to identify vulnerabilities.

#### Operations

- **Incident Management**: Develop and maintain an incident response plan that includes procedures for handling security breaches.
- **Environment Management**: Ensure that operational environments are securely configured and managed.
- **Operational Management**: Establish processes for secure management of software in production, including patch management and vulnerability response.



### BONUS: Background Scenario 2 : E-Commerce Platform Development

Imagine a mid-sized company, "OnlineNinjaSchool", that specializes in e-commerce software development. OnlineNinjaSchool has experienced rapid growth and is preparing to launch a new version of its e-commerce platform. However, recent security breaches in the industry have highlighted the need for enhanced security measures. The leadership at OnlineNinjaSchool decides to use the SAMM framework to systematically improve their software security practices.

### Step 1: Assess Current State

- **Initial Assessment**: OnlineNinjaSchool conducts an initial assessment to determine their current security practices' maturity level across the SAMM model's domains: Governance, Design, Implementation, Verification, and Operations.
- **Findings**: The assessment reveals that OnlineNinjaSchool has ad hoc security practices in the Design and Implementation phases, with no formal security testing or incident response procedures.

### Step 2: Define Objectives

- **Objective Setting**: Based on the assessment, OnlineNinjaSchool sets objectives to reach a higher maturity level in specific domains. For instance, they aim to establish formal security design practices and implement continuous security testing.

### Step 3: Develop Improvement Plan

- **Action Plan**: OnlineNinjaSchool develops an action plan that includes training for developers on secure coding practices, integrating security testing tools into the CI/CD pipeline, and establishing a security incident response team.

### Step 4: Implement Changes

- **Implementation**: Over the next six months, OnlineNinjaSchool implements the planned changes. This includes conducting security design reviews for all new features, integrating automated security scanning tools, and conducting regular incident response drills.

### Step 5: Measure and Adjust

- **Measurement**: After implementing the changes, OnlineNinjaSchool measures the impact on their software's security posture, assessing both the effectiveness of the new practices and their integration into the development lifecycle.
- **Adjustment**: Based on the results, OnlineNinjaSchool makes adjustments to their processes, such as enhancing their security training program and refining their incident response procedures.

### Outcome and Continuous Improvement

- **Improved Security Posture**: As a result of adopting SAMM, OnlineNinjaSchool's new e-commerce platform launch is successful, with a significant reduction in vulnerabilities identified in both development and post-deployment phases.
- **Continuous Improvement**: OnlineNinjaSchool commits to continuous improvement, regularly reviewing and updating their security practices in line with SAMM guidance to adapt to new threats and technologies.

### Context for Software Dev Mgr or CISO

This example demonstrates how applying a structured framework like SAMM can transform an organization's approach to software security from reactive to proactive. For Software Dev Mgr or CISO, understanding this process is crucial because it illustrates:

- The importance of integrating security throughout the SDLC, not just as a final step before deployment.
- How maturity models provide a roadmap for continuous improvement in software security practices.
- The role of governance, risk management, and compliance in shaping an organization's security strategy.